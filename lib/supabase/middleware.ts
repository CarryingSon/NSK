import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseCredentials, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

// Prijavna stran: neprijavljenega spusti noter, prijavljenega odbije na ploščo.
const PUBLIC_PATHS = new Set(["/login"]);

// Javni obrazec za včlanitev. Teče v iframeu na klubski spletni strani, zato
// mora biti dosegljiv vsem - in za razliko od prijavne strani tudi prijavljenim,
// da si ga admin lahko ogleda iz aplikacije.
// /auth/confirm vnovči žeton iz e-pošte; klicatelj takrat še nima seje.
// /odjava in /api/odjava nosita žeton v naslovu - član, ki klikne povezavo v
// obvestilu, nima seje in je ne sme potrebovati, sicer odjava ni "enostavna".
//
// Od tu naprej so naštete še strani javne klubske spletne strani, ki stoji v
// isti aplikaciji (skupina app/(javno)). Seznam je namenoma izčrpen in ne
// obrnjen privzetek: kdor doda novo stran nadzorne plošče in nanjo pozabi,
// jo s tem zapre, ne odpre - tako kot to velja že za vloge v lib/roles.ts.
const OPEN_PATHS = [
  "/vclanitev",
  "/auth/confirm",
  "/odjava",
  "/api/odjava",
  "/aktualno",
  "/ugodnosti",
  "/pridruzi-se",
  "/o-nas",
  // Statično gradivo javne strani. Vzorec v proxy.ts izvzema le slikovne
  // končnice, zato bi se PDF-ji in video brez tega ujeli v preusmeritev na
  // prijavo. Našteta je mapa in ne končnice, da naslednja vrsta datoteke ne
  // odpre iste zagate znova.
  "/dokumenti",
  "/heksnsus",
  "/stran",
];

// Naslovnica je javna, a je ni mogoče dati med OPEN_PATHS: "/" je predpona
// vsake poti in bi odprl celotno aplikacijo. Zato stoji posebej in se
// primerja natančno.
const HOME_PATH = "/";

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseCredentials();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims() preveri podpis lokalno prek JWKS namesto klica na Auth strežnik,
  // kar tej vmesni plasti prihrani en omrežni obhod na vsako zahtevo. Osvežitev
  // potekle seje se ohrani, ker getClaims() interno kliče getSession().
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims?.sub ? claimsData.claims : null;

  const { pathname } = request.nextUrl;

  if (
    pathname === HOME_PATH ||
    OPEN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return response;
  }

  const isPublicPath = PUBLIC_PATHS.has(pathname);

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";

    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectedFrom", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (user && isPublicPath) {
    const membersUrl = request.nextUrl.clone();
    membersUrl.pathname = "/dashboard";
    membersUrl.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(membersUrl);
  }

  return response;
}
