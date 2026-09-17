"use server";

import { revalidatePath } from "next/cache";

import { optInByToken, optOutByToken } from "@/lib/unsubscribe";
import type { ActionState } from "@/types/app";

function getToken(formData: FormData) {
  const value = formData.get("token");
  return typeof value === "string" ? value : "";
}

/**
 * Odjava in vrnitev med prejemnike s strani /odjava/[token].
 *
 * Akciji tečeta brez prijave - žeton iz naslova je edino dovoljenje. Zato ne
 * sprejemata id-ja člana: kdor bi ga ugibal, ne bi dosegel ničesar.
 */
export async function unsubscribeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await optOutByToken(getToken(formData));

  if (!result.ok) {
    return { error: "Te povezave ni bilo mogoče preveriti." };
  }

  revalidatePath("/members");

  return { success: "Odjavljen_a si od obveščanja." };
}

export async function resubscribeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = await optInByToken(getToken(formData));

  if (!result.ok) {
    return { error: "Te povezave ni bilo mogoče preveriti." };
  }

  revalidatePath("/members");

  return { success: "Spet si med prejemniki obvestil." };
}
