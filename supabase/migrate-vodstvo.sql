-- Vodstvo kluba za stran /o-nas/vodstvo (in predsednica na /o-nas/kontakt).
--
-- Doslej je bil seznam zapisan v kodi (lib/klub.ts), zato je vsaka sprememba
-- po volitvah zahtevala programerja. Zdaj ga klub ureja v Požiralniku pod
-- Spletna stran -> Vodstvo.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna: začetne osebe
-- vpiše samo, če je tabela prazna.

create table if not exists public.leadership (
  id uuid primary key default gen_random_uuid(),
  body text not null check (body in ('upravni', 'nadzorni')),
  name text not null,
  role text,
  email text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leadership_order_idx
on public.leadership (body, position);

drop trigger if exists set_leadership_updated_at on public.leadership;
create trigger set_leadership_updated_at
before update on public.leadership
for each row
execute function public.set_updated_at();

alter table public.leadership enable row level security;

drop policy if exists "Anyone can read leadership" on public.leadership;
create policy "Anyone can read leadership"
on public.leadership
for select
to anon
using (true);

drop policy if exists "Authenticated users can manage leadership" on public.leadership;
create policy "Authenticated users can manage leadership"
on public.leadership
for all
to authenticated
using (true)
with check (true);

insert into public.leadership (body, name, role, email, position)
select * from (values
  ('upravni', 'Liza Perko', 'Predsednica', 'lizaperko.nsk@gmail.com', 0),
  ('upravni', 'Juna Jesenšek', 'Podpredsednica', null, 1),
  ('upravni', 'Hana Jesenšek', 'Tajnica', null, 2),
  ('upravni', 'Nikita Čuček', 'Svetnica', null, 3),
  ('upravni', 'Luka Petavs', 'Blagajničar', null, 4),
  ('upravni', 'Neža Horvat', 'Predstavnica dijaške sekcije', null, 5),
  ('nadzorni', 'Miha Prudič', null, null, 0),
  ('nadzorni', 'Ambrož Puntar', null, null, 1),
  ('nadzorni', 'David Tomšič', null, null, 2)
) as seed(body, name, role, email, position)
where not exists (select 1 from public.leadership);
