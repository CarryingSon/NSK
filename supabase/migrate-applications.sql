-- Prijave za članstvo, oddane prek javnega obrazca na klubski spletni strani.
--
-- Obrazec je vgrajen v tujo stran prek iframe, zato pišejo vanj neprijavljeni
-- obiskovalci: vloga "anon" sme samo vstavljati vrstice, brati in urejati jih
-- sme le prijavljen uporabnik aplikacije.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

create extension if not exists pgcrypto;

create table if not exists public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  birth_date date,
  -- EMŠO je na prijavnici obvezen. Pri svežem zagonu je not null takoj, pri
  -- nadgradnji obstoječe baze ga vklopi blok nekaj vrstic nižje.
  emso text,
  address text,
  postal_code text,
  city text,
  -- Naziv šole oziroma fakultete; iz njega se izpelje skupina za obveščanje.
  school text not null,
  study_program text,
  study_year text,
  member_type text not null default 'student',
  -- Pot do potrdila o vpisu v shrambi. Vedro je zasebno, zato se povezava
  -- podpiše šele ob prikazu v aplikaciji.
  proof_path text,
  message text,
  status text not null default 'pending',
  processed_at timestamptz,
  processed_by text,
  -- Ko iz prijave nastane član, ju povežemo, da se ista prijava ne prenese dvakrat.
  member_id uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Za baze, kjer je skripta že tekla pred dodajanjem EMŠO.
alter table public.membership_applications
add column if not exists emso text;

-- Oblika: 13 števk. Kontrolna števka se preverja v aplikaciji, ker je izračun
-- v omejitvi tabele težje berljiv kot v kodi.
alter table public.membership_applications
drop constraint if exists membership_applications_emso_format;

alter table public.membership_applications
add constraint membership_applications_emso_format
check (emso is null or emso ~ '^[0-9]{13}$');

-- EMŠO postane obvezen, a samo kadar ga imajo vse obstoječe prijave. Brezpogojni
-- "set not null" bi ob eni sami stari prijavi brez EMŠO razveljavil celotno
-- skripto - tako pa se ta izteče, ti pa dobiš opozorilo, kaj je treba dopolniti.
do $$
begin
  if exists (
    select 1 from public.membership_applications where emso is null
  ) then
    raise notice 'EMSO ostaja opcijski v bazi: obstajajo prijave brez njega. Dopolni jih in znova pozeni to skripto.';
  else
    alter table public.membership_applications
    alter column emso set not null;
  end if;
end
$$;

create index if not exists membership_applications_created_at_idx
  on public.membership_applications (created_at desc);
create index if not exists membership_applications_status_idx
  on public.membership_applications (status);

alter table public.membership_applications enable row level security;

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

-- Shramba za potrdila o vpisu. Vedro NI javno - potrdilo o vpisu je osebni
-- dokument, zato se do njega pride samo prek podpisane povezave iz aplikacije.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'potrdila',
  'potrdila',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/heic']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/heic'];

drop policy if exists "Anyone can upload a proof" on storage.objects;
create policy "Anyone can upload a proof"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'potrdila');

drop policy if exists "Authenticated users can read proofs" on storage.objects;
create policy "Authenticated users can read proofs"
on storage.objects
for select
to authenticated
using (bucket_id = 'potrdila');

drop policy if exists "Authenticated users can delete proofs" on storage.objects;
create policy "Authenticated users can delete proofs"
on storage.objects
for delete
to authenticated
using (bucket_id = 'potrdila');
