-- Neobvezen gumb na koncu članka, npr. "Včlani se" s povezavo na prijavnico
-- ali "Prijavi se" s povezavo na obrazec za dogodek.
--
-- Zaženi v Supabase SQL urejevalniku po migrate-clanki.sql. Skripta je
-- idempotentna.

alter table public.articles
add column if not exists cta_label text;

alter table public.articles
add column if not exists cta_url text;
