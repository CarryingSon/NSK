-- Soglasji za prijavo v sistem Študentske organizacije Slovenije in sled o tem,
-- ali je bila prijava tja res posredovana.
--
-- Obrazec na studentski-klubi.si zahteva dve soglasji: splošne pogoje s
-- politiko zasebnosti (obvezno) in uporabo podatkov za obveščanje (neobvezno).
-- Klub ju zbira na svoji prijavnici in naprej pošlje točno to, kar je član
-- izbral - soglasja se ne sme odkljukati namesto njega.
--
-- Prijava v ŠOS se zgodi samo, kadar sta obkljukani obe. Zato ju hranimo tudi
-- potem, ko je prijava obdelana: brez zapisa ne bi znali dokazati, na kaj je
-- član pristal.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

alter table public.membership_applications
add column if not exists terms_accepted boolean not null default false;

alter table public.membership_applications
add column if not exists notifications_accepted boolean not null default false;

-- Kdaj je prijava odšla v ŠOS. Prazno pomeni, da tja ni šla - bodisi ker član
-- ni dal obeh soglasij, bodisi ker je poskus spodletel.
alter table public.membership_applications
add column if not exists sos_registered_at timestamptz;

-- Zadnja napaka pri pošiljanju v ŠOS. Oddaja prijave zaradi nje nikoli ne pade:
-- član mora postati član kluba tudi takrat, kadar je tuj sistem nedosegljiv.
alter table public.membership_applications
add column if not exists sos_error text;

create index if not exists membership_applications_sos_idx
on public.membership_applications (sos_registered_at);
