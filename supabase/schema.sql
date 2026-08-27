create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  birth_date date,
  address text,
  postal_code text,
  city text,
  faculty text,
  membership_status text not null default 'active',
  membership_year integer,
  membership_paid boolean not null default false,
  membership_fee numeric default 0,
  joined_at date default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.members
add column if not exists faculty text;

alter table public.members
add column if not exists emso text;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  max_attendees integer,
  status text not null default 'upcoming',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  status text not null default 'registered',
  registered_at timestamptz not null default now(),
  notes text,
  constraint event_registrations_member_event_unique unique (member_id, event_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text,
  discount_value numeric,
  valid_from date,
  valid_to date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.print_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.members(id) on delete set null,
  title text,
  quantity integer not null default 1,
  notes text,
  created_at timestamptz not null default now()
);

-- Nastavitve aplikacije kot pari ključ/vrednost. Zaenkrat hrani samo mesečno
-- kvoto kopij na člana, a se brez migracije razširi na karkoli drugega.
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('print_monthly_quota', '300')
on conflict (key) do nothing;

-- Prijave za članstvo z javnega obrazca. Vanje pišejo neprijavljeni obiskovalci,
-- zato ima ta tabela edina politiko za vlogo "anon" - in še ta samo za vstavljanje.
create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  birth_date date,
  emso text not null,
  address text,
  postal_code text,
  city text,
  school text not null,
  study_program text,
  study_year text,
  member_type text not null default 'student',
  proof_path text,
  message text,
  status text not null default 'pending',
  processed_at timestamptz,
  processed_by text,
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now(),
  -- Kontrolna števka se preverja v aplikaciji; tu le oblika.
  constraint membership_applications_emso_format check (emso ~ '^[0-9]{13}$')
);

-- Obveščanje: kampanja hrani vsebino, čakalna vrsta pa enega prejemnika na
-- vrstico. Pošiljanje teče v serijah, zato mora biti stanje vsakega prejemnika
-- vidno posebej.
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
  constraint email_queue_campaign_email_unique unique (campaign_id, to_email)
);

create index if not exists members_status_idx on public.members (membership_status);
create index if not exists members_email_idx on public.members (email);
create index if not exists members_joined_at_idx on public.members (joined_at);
create index if not exists events_starts_at_idx on public.events (starts_at);
create index if not exists events_status_idx on public.events (status);
create index if not exists event_registrations_member_idx on public.event_registrations (member_id);
create index if not exists event_registrations_event_idx on public.event_registrations (event_id);
create index if not exists coupons_active_idx on public.coupons (active);
create index if not exists print_records_member_idx on public.print_records (member_id);
create index if not exists membership_applications_created_at_idx on public.membership_applications (created_at desc);
create index if not exists membership_applications_status_idx on public.membership_applications (status);
create index if not exists email_campaigns_created_at_idx on public.email_campaigns (created_at desc);
create index if not exists email_campaigns_status_idx on public.email_campaigns (status);
create index if not exists email_queue_campaign_idx on public.email_queue (campaign_id);
create index if not exists email_queue_status_idx on public.email_queue (campaign_id, status);
create index if not exists email_queue_sent_at_idx on public.email_queue (sent_at desc);

drop trigger if exists set_members_updated_at on public.members;
create trigger set_members_updated_at
before update on public.members
for each row
execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists set_email_campaigns_updated_at on public.email_campaigns;
create trigger set_email_campaigns_updated_at
before update on public.email_campaigns
for each row
execute function public.set_updated_at();

alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.coupons enable row level security;
alter table public.print_records enable row level security;
alter table public.membership_applications enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_queue enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "Authenticated users can manage members" on public.members;
create policy "Authenticated users can manage members"
on public.members
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage events" on public.events;
create policy "Authenticated users can manage events"
on public.events
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage registrations" on public.event_registrations;
create policy "Authenticated users can manage registrations"
on public.event_registrations
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage coupons" on public.coupons;
create policy "Authenticated users can manage coupons"
on public.coupons
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage print records" on public.print_records;
create policy "Authenticated users can manage print records"
on public.print_records
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage settings" on public.app_settings;
create policy "Authenticated users can manage settings"
on public.app_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can submit an application" on public.membership_applications;
create policy "Anyone can submit an application"
on public.membership_applications
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can read applications" on public.membership_applications;
create policy "Authenticated users can read applications"
on public.membership_applications
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can update applications" on public.membership_applications;
create policy "Authenticated users can update applications"
on public.membership_applications
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete applications" on public.membership_applications;
create policy "Authenticated users can delete applications"
on public.membership_applications
for delete
to authenticated
using (true);

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

-- Vedro za potrdila o vpisu in njegove politike so v supabase/migrate-applications.sql:
-- storage.buckets in storage.objects nista v shemi public, zato ju ta datoteka
-- namenoma ne ustvarja.
