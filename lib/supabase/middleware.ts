import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseCredentials, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = new Set(["/login"]);

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
