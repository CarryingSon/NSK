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
        error: "Prijava ni uspela. Preveri e-pošto in geslo.",
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
