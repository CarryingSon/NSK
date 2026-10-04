-- Dnevnik vse e-pošte, ki jo pošlje aplikacija.
--
-- Obvestila, testna obvestila, pozdravi novim članom, pristopne izjave klubu in
-- prijave napak - vse na enem mestu, s stanjem in vsebino za ogled.
--
-- Pri obvestilih vsebine ne hranimo za vsakega prejemnika posebej (1500 kopij
-- istega besedila); ogled jo sestavi iz obvestila v email_campaigns. Priponk ne
-- hranimo, le njihova imena in velikosti - izjava vsebuje EMŠO.
--
-- Piše samo strežnik (service_role), bere le prijavljen uporabnik.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  to_email text not null,
  recipient_name text,
  subject text not null,
  html text,
  text_body text,
  campaign_id uuid references public.email_campaigns (id) on delete set null,
  member_id uuid references public.members (id) on delete set null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_log_created_idx on public.email_log (created_at desc);
create index if not exists email_log_kind_idx on public.email_log (kind, created_at desc);
create index if not exists email_log_to_idx on public.email_log (lower(to_email));

alter table public.email_log enable row level security;

drop policy if exists "Authenticated users can read email log" on public.email_log;
create policy "Authenticated users can read email log"
on public.email_log
for select
to authenticated
using (true);
