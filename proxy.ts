import { NextResponse, type NextRequest } from "next/server";

import { appHost, appPaths, publicHosts } from "@/lib/constants";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Vsaki domeni da tisto, čemur je namenjena.
 *
 * Javna stran in nadzorna plošča stojita v isti aplikaciji, zato bi bila brez
 * tega vsaka pot dosegljiva na obeh domenah. Tu se to razdeli: plošča živi na
 * poziralnik.nsk-klub.si, javna stran na nsk-klub.si.
 *
 * Preusmeritev je trajna (308), ker je to stalna razdelitev in ne začasna -
 * iskalniki tako obdržijo en naslov na vsebino, metoda zahteve pa se ohrani.
 *
 * Neznani gostitelji (localhost, predogledi na vercel.app) padejo skozi
 * nedotaknjeni, sicer razvoj in predogledi ne bi delovali.
 */
function routeByHost(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase();

  if (!host) {
    return null;
  }

  const { pathname } = request.nextUrl;
  const isAppPath = appPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Na poddomeni plošče korenska pot nima kaj pokazati - javna naslovnica tu
  // ni na mestu, zato jo prijava prevzame in prijavljenega pelje naprej.
  if (host === appHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url, 308);
  }

  // Na javni domeni delovno okolje ne sodi; pot se ohrani, da povezava iz
  // e-pošte ali zaznamka pripelje točno tja, kamor je kazala.
  if (publicHosts.includes(host) && isAppPath) {
    const url = request.nextUrl.clone();
    url.host = appHost;
    url.port = "";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const redirected = routeByHost(request);

  if (redirected) {
    return redirected;
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
