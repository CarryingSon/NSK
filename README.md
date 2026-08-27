# Poziralnik

Poziralnik je interna administracijska spletna aplikacija za Notranjski študentski klub. Trenutno pokriva vodenje članov, evidenco tiska, obveščanje članov po emailu in osnovno administracijo v zasebnem dashboard okolju.

## Tehnologije

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Database
- Nodemailer SMTP povezava za pošiljanje obvestil
- shadcn/ui komponente
- Lucide React ikone
- Pripravljeno za deploy na Vercel

## Lokalni zagon

1. Namesti odvisnosti:

```bash
npm install
```

2. Ustvari lokalno `.env.local` datoteko iz primerka:

```bash
cp .env.example .env.local
```

3. V `.env.local` nastavi:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM="NŠK <obvestila@example.si>"
SMTP_REPLY_TO=...
```

4. Zaženi razvojni strežnik:

```bash
npm run dev
```

5. Odpri `http://localhost:3000`.

## Nastavitev Supabase

1. Ustvari nov Supabase projekt.
2. V Supabase Dashboard odpri SQL Editor.
3. Zaženi vsebino datoteke [supabase/schema.sql](/Users/jurekrizman/Documents/NŠK%20-%20po/supabase/schema.sql).
4. V `Authentication > Users` ustvari prvega uporabnika z e-pošto in geslom.
5. V `Project Settings > API` kopiraj `Project URL` in `anon public` ključ v `.env.local`.

Če Supabase ni konfiguriran, aplikacija še vedno prikaže UI in prazna stanja, vendar prijava in shranjevanje podatkov ne bosta delovala.

## SQL schema

Datoteka [supabase/schema.sql](/Users/jurekrizman/Documents/NŠK%20-%20po/supabase/schema.sql) vsebuje:

- tabele `members`, `print_records`, `email_campaigns` in `email_queue`
- `updated_at` trigger za `members` in `events`
- osnovne indekse
- omogočen RLS na vseh glavnih tabelah
- politike za prijavljene (`authenticated`) uporabnike

## Email obveščanje

- Obvestilo se sestavi na `/notifications`: naslov, podnaslov na oranžni glavi, vsebina
  v bogatem urejevalniku, neobvezen CTA gumb in nastavitve pošiljanja.
- Občinstvo je lahko celotno članstvo, **samo študenti** ali **samo dijaki**. Skupina se
  izpelje iz polja `faculty` (šola oziroma fakulteta) prek `classifySchool()` v
  [lib/constants.ts](/Users/jurekrizman/Documents/NŠK%20-%20po/lib/constants.ts) - najprej
  po seznamih šol, nato po besednih značilnicah. Kar se ne uvrsti, ostane dosegljivo prek
  občinstva "vsi člani".
- Pošiljanje ne teče v eni zahtevi: kampanja se zapiše v `email_campaigns`, prejemniki v
  `email_queue`, nato pa stran zgodovine pošilja v serijah po 20 sporočil, dokler ni vrsta
  prazna ali dokler ni dosežena dnevna omejitev.
- Vsaka vrstica se pred pošiljanjem pogojno prevzame (`status = 'sending'`), zato dva
  odprta zavihka ne pošljeta istega sporočila dvakrat.
- Dnevna omejitev je `emailDailyLimit` (450, z rezervo pod Gmailovih 500), posamezna
  kampanja pa ima svojo, nižjo omejitev.
- Vsebina iz urejevalnika se pred zapisom očisti v
  [lib/email-content.ts](/Users/jurekrizman/Documents/NŠK%20-%20po/lib/email-content.ts) -
  v e-pošto gre samo ozek nabor oznak.
- Pošiljanje uporablja SMTP, zato lahko priklopiš Gmail, Outlook ali drug ponudnik.

Za obstoječo bazo zaženi
[supabase/migrate-notifications.sql](/Users/jurekrizman/Documents/NŠK%20-%20po/supabase/migrate-notifications.sql).

## Deploy na Vercel

1. Potisni repozitorij na GitHub.
2. Ustvari nov Vercel projekt in poveži GitHub repo.
3. Dodaj naslednji environment variable:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
SMTP_REPLY_TO
```

4. Deployaj projekt.

Po deployu se prijava in zaščita routov izvajata prek Supabase Auth cookie session mehanizma, email obveščanje pa deluje takoj, ko so SMTP spremenljivke pravilno nastavljene.

## Projektna struktura

```text
app/
components/
lib/
types/
supabase/
supabase/schema.sql
.env.example
README.md
```

## Pomembne opombe

- Aplikacija uporablja App Router in server/client komponente po Next.js standardih.
- CRUD operacije za člane, evidenco tiska in email zgodovino potekajo prek Supabase server clienta.
- Middleware zaščiti zasebne poti, ko je Supabase pravilno konfiguriran.
- RLS politike so namenoma osnovne in dovoljujejo dostop vsem prijavljenim uporabnikom; po potrebi jih lahko kasneje zaostriš po vlogah.
