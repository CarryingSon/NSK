# Poziralnik

Poziralnik je interna administracijska spletna aplikacija za študentski klub. Namenjena je vodenju članov, prijav, dogodkov, kupončkov, evidence tiska in osnovne administracije v enem zasebnem dashboard okolju.

## Tehnologije

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Supabase Auth + Database
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

- tabele `members`, `events`, `event_registrations`, `coupons`, `print_records`
- `updated_at` trigger za `members` in `events`
- osnovne indekse
- omogočen RLS na vseh glavnih tabelah
- politike za prijavljene (`authenticated`) uporabnike

## Deploy na Vercel

1. Potisni repozitorij na GitHub.
2. Ustvari nov Vercel projekt in poveži GitHub repo.
3. Dodaj naslednji environment variable:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. Deployaj projekt.

Po deployu se prijava in zaščita routov izvajata prek Supabase Auth cookie session mehanizma.

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
- CRUD operacije za člane, dogodke in prijave potekajo prek Supabase server clienta.
- Middleware zaščiti zasebne poti, ko je Supabase pravilno konfiguriran.
- RLS politike so namenoma osnovne in dovoljujejo dostop vsem prijavljenim uporabnikom; po potrebi jih lahko kasneje zaostriš po vlogah.
