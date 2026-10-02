-- Članki za razdelek Aktualno na klubski spletni strani.
--
-- Doslej so novice prihajale s starega GraphQL strežnika prejšnjega izvajalca.
-- Klub jih zdaj piše sam v Požiralniku; starih objav ne prenašamo.
--
-- Obiskovalec strani (anon) vidi samo objavljene članke, osnutki ostanejo
-- vidni le prijavljenim. Slike stojijo v javnem vedru "clanki", ker jih mora
-- stran prikazati brez prijave.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',
  cover_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists articles_published_idx
on public.articles (status, published_at desc);

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
on public.articles
for select
to anon
using (status = 'published');

drop policy if exists "Authenticated users can manage articles" on public.articles;
create policy "Authenticated users can manage articles"
on public.articles
for all
to authenticated
using (true)
with check (true);

-- Javno vedro: slike se prikazujejo na strani brez prijave. Nalaga in briše
-- samo prijavljen uporabnik Požiralnika.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'clanki',
  'clanki',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Authenticated users can upload article images" on storage.objects;
create policy "Authenticated users can upload article images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'clanki');

drop policy if exists "Authenticated users can delete article images" on storage.objects;
create policy "Authenticated users can delete article images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'clanki');
