-- Odjava od obveščanja.
--
-- Obvestila o dogodkih in ugodnostih so po GDPR trženjska komunikacija in
-- morajo imeti enostavno odjavo, ne glede na to, kako malo jih pošljemo.
-- Gmail in Yahoo isto zahtevata od množičnih pošiljateljev; klub je pod tem
-- pragom, a glava List-Unsubscribe deluje v njuno korist tudi pri manjših.
--
-- Odjava NE izbriše člana in ne spremeni njegovega statusa članstva - član
-- ostane član, samo pošte ne dobiva več.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

alter table public.members
add column if not exists notifications_opt_out boolean not null default false;

alter table public.members
add column if not exists notifications_opt_out_at timestamptz;

-- Žeton nadomešča prijavo: povezava iz e-pošte mora delovati brez gesla, zato
-- mora biti nepredvidljiva in vezana na natanko enega člana. gen_random_uuid()
-- je volatilen, zato ga Postgres izračuna za vsako obstoječo vrstico posebej.
alter table public.members
add column if not exists notifications_token uuid not null default gen_random_uuid();

create unique index if not exists members_notifications_token_idx
on public.members (notifications_token);

create index if not exists members_opt_out_idx
on public.members (notifications_opt_out);
