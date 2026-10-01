-- Spletna prijavnica, usklajena s papirnato pristopno izjavo.
--
-- Izjava zahteva občino prebivanja in seznanitev z obdelavo osebnih podatkov,
-- poleg tega pa ponuja tri neobvezna soglasja: vnos v sistem digitalnega
-- članstva ŠOS, uporabo fotografij in posnetkov ter pošiljanje e-novic. Vse
-- hranimo pri prijavi, ker je to dokaz, na kaj je član pristal.
--
-- Soglasje za ŠOS nadomesti dosedanji kljukici terms_accepted in
-- notifications_accepted. Stolpca ostaneta zaradi starejših prijav.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

alter table public.membership_applications
add column if not exists municipality text;

alter table public.membership_applications
add column if not exists privacy_acknowledged boolean not null default false;

alter table public.membership_applications
add column if not exists sos_consent boolean not null default false;

alter table public.membership_applications
add column if not exists media_consent boolean not null default false;

alter table public.membership_applications
add column if not exists newsletter_consent boolean not null default false;
