-- Omejitev pošiljanja iz dnevne v urno.
--
-- Klub pošilja prek lastnega strežnika mail.nsk-klub.si, ta pa dovoli 100
-- sporočil na uro. Prejšnja omejitev je bila dnevna in vezana na Gmailovih 500
-- na dan; z dnevno kvoto bi kampanja poskusila poslati vse naenkrat in bi jo
-- strežnik zavrnil po stotem sporočilu.
--
-- Okno štetja je v aplikaciji drsečih šestdeset minut, ne koledarska ura - tako
-- kvota ne more biti presežena v nobenem šestdesetminutnem obdobju.
--
-- Zaženi v Supabase SQL urejevalniku. Skripta je idempotentna.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'email_campaigns'
      and column_name = 'daily_limit'
  ) then
    alter table public.email_campaigns rename column daily_limit to hourly_limit;
  end if;
end
$$;

alter table public.email_campaigns
add column if not exists hourly_limit integer not null default 80;

alter table public.email_campaigns
alter column hourly_limit set default 80;

-- Obstoječe kampanje so nosile dnevno omejitev (privzeto 250), ki je za urno
-- kvoto previsoka. Vse, kar presega 80, znižamo - sicer bi prva serija stare
-- kampanje poskusila poslati več, kot strežnik dovoli.
update public.email_campaigns
set hourly_limit = 80
where hourly_limit > 80;
