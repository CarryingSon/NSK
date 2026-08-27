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

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  body text,
  status text not null default 'sent',
  error_message text,
  metadata text,
  created_at timestamptz not null default now()
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
create index if not exists email_logs_created_at_idx on public.email_logs (created_at desc);
create index if not exists email_logs_subject_idx on public.email_logs (subject);

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

alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.coupons enable row level security;
alter table public.print_records enable row level security;
alter table public.email_logs enable row level security;

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

drop policy if exists "Authenticated users can manage email logs" on public.email_logs;
create policy "Authenticated users can manage email logs"
on public.email_logs
for all
to authenticated
using (true)
with check (true);
