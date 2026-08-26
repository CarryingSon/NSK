-- Ustvarjanje potrjenega uporabnika neposredno v shemi auth.
--
-- Nadomestne vrednosti <TVOJ-EMAIL>, <ADMIN-EMAIL> in <GESLO> zamenjaj
-- sele v SQL Editorju. V repozitorij se ne vpisujejo, ker je javen.
--
-- Zakaj: javni signUp zahteva dostavljivo e-poštno domeno in poslano
-- potrditveno pošto. SQL Editor teče kot postgres in oboje obide.
--
-- POZOR: pisanje v auth.users ni uradno podprto. Uporabljaj samo za
-- začetni administratorski račun; nadaljnje uporabnike raje prek
-- Authentication -> Users -> Add user.

-- ---------------------------------------------------------------
-- 0) Pregled obstoječega stanja
-- ---------------------------------------------------------------
select id, email, email_confirmed_at, created_at
from auth.users
order by created_at desc;

-- ---------------------------------------------------------------
-- 1) MOŽNOST A - samo potrdi že obstoječi račun
--    Najmanjši poseg. confirmed_at je generiran stolpec, zato
--    nastavljamo izključno email_confirmed_at.
-- ---------------------------------------------------------------
update auth.users
set email_confirmed_at = now(),
    updated_at = now()
where email = '<TVOJ-EMAIL>'
returning id, email, email_confirmed_at;

-- ---------------------------------------------------------------
-- 2) MOŽNOST B - ustvari nov, že potrjen račun
--    Vstaviti je treba tudi vrstico v auth.identities, sicer
--    prijava z geslom v novejših različicah GoTrue ne deluje.
-- ---------------------------------------------------------------
with new_user as (
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    '<ADMIN-EMAIL>',
    crypt('<GESLO>', gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    '{}'::jsonb,
    now(),
    now()
  )
  returning id, email
)
insert into auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  nu.id::text,
  nu.id,
  jsonb_build_object(
    'sub', nu.id::text,
    'email', nu.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
from new_user nu
returning user_id;

-- ---------------------------------------------------------------
-- 3) Preverba
-- ---------------------------------------------------------------
select u.email,
       u.email_confirmed_at is not null as potrjen,
       i.provider
from auth.users u
left join auth.identities i on i.user_id = u.id
order by u.created_at desc;

-- ---------------------------------------------------------------
-- Menjava gesla pozneje
-- ---------------------------------------------------------------
-- update auth.users
-- set encrypted_password = crypt('<NOVO-GESLO>', gen_salt('bf')),
--     updated_at = now()
-- where email = '<ADMIN-EMAIL>';
