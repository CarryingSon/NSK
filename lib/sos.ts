import "server-only";

/**
 * Prijava novega člana v sistem Študentske organizacije Slovenije.
 *
 * Klub je član Zveze ŠKIS, zato mora svoje člane zavesti tudi v skupnem
 * sistemu na studentski-klubi.si. Tam stoji javni obrazec (NocoBase), ki ga je
 * doslej nekdo izpolnjeval ročno za vsakega člana posebej.
 *
 * Postopek ima dva koraka:
 *   1. GET publicForms:getMeta/<ključ>  -> kratkoživ žeton (velja eno uro)
 *   2. POST users:create z glavo X-Form-Token -> zapis in potrditvena e-pošta
 *
 * Žeton velja samo uro, zato ga vzamemo sproti ob vsaki prijavi; shranjevanje
 * bi prineslo več težav kot koristi.
 *
 * Član nato v prejeti e-pošti dobi kodo, ki jo sam vnese na studentski-klubi.si.
 * Tega koraka klub ne more opraviti namesto njega in tudi ne sme.
 */

const sosBaseUrl = "https://studentski-klubi.si";

// Ključ javnega obrazca iz naslova https://studentski-klubi.si/public-forms/<ključ>.
const sosFormKey = "jui1g3swbxz";

// NŠK v šifrantu klubov na studentski-klubi.si.
const sosClubId = 356401037312009;

// Tuj sistem ne sme zadrževati oddaje prijave, zato vsak klic omejimo.
const requestTimeoutMs = 10_000;

export interface SosRegistrationInput {
  firstName: string;
  lastName: string;
  emso: string;
  email: string;
  postalCode?: string | null;
}

export type SosRegistrationResult =
  | { ok: true }
  | { ok: false; error: string };

async function sosFetch(path: string, init: RequestInit = {}) {
  return fetch(`${sosBaseUrl}${path}`, {
    ...init,
    signal: AbortSignal.timeout(requestTimeoutMs),
    // Odgovor je vsakič svež; predpomnjenje bi vrnilo potekel žeton.
    cache: "no-store",
  });
}

/** Žeton javnega obrazca. Z njim se avtorizirata branje šifrantov in zapis. */
async function getFormToken(): Promise<string> {
  const response = await sosFetch(
    `/api/publicForms:getMeta/${sosFormKey}`,
  );

  if (!response.ok) {
    throw new Error(`getMeta je vrnil ${response.status}`);
  }

  const payload = (await response.json()) as { data?: { token?: string } };
  const token = payload.data?.token;

  if (!token) {
    throw new Error("Odgovor getMeta ne vsebuje žetona.");
  }

  return token;
}

/**
 * Poišče šifrant poštnih številk kluba in vrne id za člankovo pošto.
 *
 * Polje je v obrazcu neobvezno, zato tu nobena napaka ni usodna: če šifranta ne
 * dobimo ali se številka ne ujema, prijavo pošljemo brez nje.
 */
async function findClubPostId(
  token: string,
  postalCode?: string | null,
): Promise<number | null> {
  const wanted = Number((postalCode ?? "").trim());

  if (!Number.isInteger(wanted)) {
    return null;
  }

  try {
    const response = await sosFetch(
      `/api/clubPostNumbers:list?paginate=false&filter=${encodeURIComponent(
        JSON.stringify({ FK_ClubPosts_Clubs: sosClubId }),
      )}`,
      { headers: { "X-Form-Token": token } },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: Array<{ id?: number; postNumber?: number }>;
    };

    const match = payload.data?.find((row) => row.postNumber === wanted);

    return match?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Prijavi člana v ŠOS.
 *
 * Kliči samo, kadar je član dal obe soglasji - funkcija tega ne preverja, ker
 * soglasje ni tehnično stanje, ampak odločitev, ki mora biti vidna na mestu
 * klica.
 *
 * Nikoli ne vrže: oddaja klubske prijavnice ne sme pasti zaradi tujega sistema.
 */
export async function registerMemberWithSos(
  input: SosRegistrationInput,
): Promise<SosRegistrationResult> {
  try {
    const token = await getFormToken();
    const clubPostId = await findClubPostId(token, input.postalCode);

    const body: Record<string, unknown> = {
      firstName: input.firstName,
      lastName: input.lastName,
      IdentityNumber: input.emso,
      email: input.email,
      clubId: sosClubId,
      // Obe soglasji sta tu vedno true - do sem pridemo samo, če ju je član dal.
      termsAccepted: true,
      notificationsAccepted: true,
    };

    if (clubPostId !== null) {
      body.clubPosts = clubPostId;
    }

    const response = await sosFetch("/api/users:create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Form-Token": token,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");

      return {
        ok: false,
        error: `users:create je vrnil ${response.status}. ${detail.slice(0, 300)}`.trim(),
      };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Neznana napaka.";

    return { ok: false, error: message };
  }
}

/** Naslov obrazca za ročno dokončanje, kadar samodejna prijava spodleti. */
export const sosFormUrl = `${sosBaseUrl}/public-forms/${sosFormKey}`;
