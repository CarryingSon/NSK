-- Obveščanje v2: namesto ravnega dnevnika e-pošte (email_logs) hranimo kampanjo
-- in njeno čakalno vrsto prejemnikov. Pošiljanje teče v serijah, ker Gmail SMTP
-- zavrne prevelike sunke, serverless funkcija pa ne sme teči nekaj minut.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

create extension if not exists pgcrypto;

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  content_html text not null,
  cta_label text,
  cta_url text,
  campaign_type text not null default 'obvestilo',
  audience text not null default 'all',
  daily_limit integer not null default 250,
  status text not null default 'queued',
  total_recipients integer not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.email_queue (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  member_id uuid references public.members(id) on delete set null,
  to_email text not null,
  first_name text,
  last_name text,
  segment text,
  status text not null default 'pending',
  error_message text,
  attempts integer not null default 0,
  -- Trenutek prevzema vrstice v pošiljanje. Prekinjena serija pusti vrstico v
  -- stanju 'sending'; po petih minutah jo naslednji zagon vrne v vrsto.
  claimed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  -- Isti član ne more dvakrat pristati v isti kampanji, tudi če se akcija
  -- ponovi ob dvojnem kliku.
  constraint email_queue_campaign_email_unique unique (campaign_id, to_email)
);

create index if not exists email_campaigns_created_at_idx
  on public.email_campaigns (created_at desc);
create index if not exists email_campaigns_status_idx
  on public.email_campaigns (status);
create index if not exists email_queue_campaign_idx
  on public.email_queue (campaign_id);
create index if not exists email_queue_status_idx
  on public.email_queue (campaign_id, status);
-- Dnevna omejitev šteje uspešno poslane zapise po vseh kampanjah.
create index if not exists email_queue_sent_at_idx
  on public.email_queue (sent_at desc);

drop trigger if exists set_email_campaigns_updated_at on public.email_campaigns;
create trigger set_email_campaigns_updated_at
before update on public.email_campaigns
for each row
execute function public.set_updated_at();

alter table public.email_campaigns enable row level security;
alter table public.email_queue enable row level security;

drop policy if exists "Authenticated users can manage email campaigns" on public.email_campaigns;
create policy "Authenticated users can manage email campaigns"
on public.email_campaigns
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage email queue" on public.email_queue;
create policy "Authenticated users can manage email queue"
on public.email_queue
for all
to authenticated
using (true)
with check (true);

-- Stara tabela email_logs ni več v uporabi. Namerno je NE brišemo samodejno -
-- vsebuje zgodovino že poslanih obvestil. Ko je zgodovina prepisana ali ni več
-- potrebna, odkomentiraj naslednjo vrstico in jo zaženi:
--
-- drop table if exists public.email_logs;
