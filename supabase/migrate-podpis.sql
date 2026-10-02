-- Lastnoročni podpis na spletni prijavnici.
--
-- Podpis (PNG) stoji v zasebnem vedru "potrdila" pod podpisi/, ker je enako
-- občutljiv kot potrdilo o vpisu. Vriše se v pristopno izjavo na mesto
-- podpisa člana.
--
-- Soglasje za obveščanje ŠOS (notifications_accepted) stolpec že ima - prijavnica
-- ga zdaj spet zbira in ga ob odobritvi pošlje v sistem ŠOS.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

alter table public.membership_applications
add column if not exists signature_path text;
