-- E-naslovi, ki ne delujejo.
--
-- Ko pošta članu pride nazaj kot nedostavljiva (bounce), ga označimo. Tak
-- član ne dobiva več obvestil, v evidenci pa ima ob e-naslovu rdečo piko, da
-- ga ob naslednjem obisku vprašate za pravega.
--
-- Gmail sporočilo vedno sprejme in šele nato pošlje povratnico na klubski
-- naslov. Zato oznako večinoma postavi pregled nabiralnika (api/cron/bounces),
-- le redko že strežnik ob pošiljanju.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

alter table public.members
add column if not exists email_bounced boolean not null default false;

alter table public.members
add column if not exists email_bounced_at timestamptz;

-- Kaj je odgovoril prejemnikov strežnik, npr. "550 5.1.1 ... does not exist".
alter table public.members
add column if not exists email_bounce_reason text;

-- Kdaj je kdo oznako ročno odstranil. Povratnice, starejše od tega, pregled
-- nabiralnika preskoči - sicer bi jo ob naslednjem zagonu postavil nazaj.
alter table public.members
add column if not exists email_bounce_cleared_at timestamptz;

create index if not exists members_email_bounced_idx
on public.members (email_bounced);
