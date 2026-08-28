-- Vloge v aplikaciji: administrator in uradnik.
--
-- Vloga je zapisana v auth.users.raw_app_meta_data. Ta polja uporabnik ne more
-- spreminjati sam (za razliko od raw_user_meta_data), pride pa v žeton, zato jo
-- aplikacija prebere brez dodatne poizvedbe.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

-- ---------------------------------------------------------------
-- 1) Pregled: kdo ima kakšno vlogo
-- ---------------------------------------------------------------
select
  email,
  coalesce(raw_app_meta_data ->> 'role', '(brez vloge)') as vloga,
  last_sign_in_at
from auth.users
order by created_at;

-- ---------------------------------------------------------------
-- 2) Obstoječi računi postanejo administratorji
--    Do zdaj so vsi videli vse; brez tega bi jih nova pravila ob prvi
--    prijavi vrgla na "nimaš dostopa". Novi uporabniki dobijo vlogo ob
--    povabilu iz aplikacije.
-- ---------------------------------------------------------------
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role', 'admin'),
    updated_at = now()
where raw_app_meta_data ->> 'role' is null;

-- ---------------------------------------------------------------
-- 3) Preverba
-- ---------------------------------------------------------------
select
  email,
  raw_app_meta_data ->> 'role' as vloga
from auth.users
order by email;

-- ---------------------------------------------------------------
-- Ročna sprememba vloge, če je kdaj potrebna mimo aplikacije
-- ---------------------------------------------------------------
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
--       || jsonb_build_object('role', 'officer'),
--     updated_at = now()
-- where email = '<EMAIL>';
