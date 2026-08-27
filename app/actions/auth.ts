"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const genericLoginError = "Prijava ni uspela. Preveri uporabniško ime in geslo.";

function getLoginErrorMessage(error: unknown) {
  if (!error || typeof error !== "object") {
    return genericLoginError;
  }

  const { code, status, name } = error as {
    code?: string;
    status?: number;
    name?: string;
  };

  // Supabase ni dosegljiv - izpad omrežja, zaustavljen projekt, napaka DNS.
  // Brez te veje je videti povsem enako kot napačno geslo, kar zavaja.
  if (name === "AuthRetryableFetchError" || status === 0) {
    return "Strežnik ni dosegljiv. Preveri povezavo in poskusi znova.";
  }

  if (status === 429 || code === "over_request_rate_limit") {
    return "Preveč zaporednih poskusov. Počakaj minuto in poskusi znova.";
  }

  // Novejši Supabase za nepotrjen račun vrne invalid_credentials in te veje ne
  // sproži, starejše različice in drugačne nastavitve pa jo še vedno vrnejo.
  if (code === "email_not_confirmed") {
    return "Račun še ni potrjen. Preveri e-pošto in klikni potrditveno povezavo.";
  }

  return genericLoginError;
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Preveri vnesene podatke.",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return {
        error: getLoginErrorMessage(error),
      };
    }
  } catch (error) {
    console.error("Napaka pri prijavi", error);
    return {
      error:
        "Supabase trenutno ni konfiguriran. Preveri okoljske spremenljivke in povezavo.",
    };
  }

  revalidatePath("/", "layout");

  const redirectedFrom = getStringValue(formData, "redirectTo");
  redirect(redirectedFrom || "/dashboard");
}

export async function logoutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Napaka pri odjavi", error);
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
