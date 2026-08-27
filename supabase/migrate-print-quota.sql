-- Poženi v Supabase SQL Editorju.
-- Doda tabelo nastavitev in vanjo zapiše privzeto mesečno kvoto kopij.

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('print_monthly_quota', '300')
on conflict (key) do nothing;

alter table public.app_settings enable row level security;

drop policy if exists "Authenticated users can manage settings" on public.app_settings;
create policy "Authenticated users can manage settings"
on public.app_settings
for all
to authenticated
using (true)
with check (true);

-- Popravki se beležijo kot zapisi z negativno količino; stolpec quantity je
-- navaden integer, zato sprememba sheme ni potrebna.

-- Preverba
select key, value from public.app_settings;
