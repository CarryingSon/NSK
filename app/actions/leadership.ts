"use server";

import { revalidatePath } from "next/cache";

import { requireAccess } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { leadershipSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

/**
 * Shrani celoten seznam vodstva, kot ga kaže urejevalnik: obstoječe osebe
 * posodobi, nove doda, odstranjene izbriše. Vrstni red v vsakem odboru je
 * vrstni red na strani.
 */
export async function saveLeadershipAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAccess("/vodstvo");

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("people") ?? "[]"));
  } catch {
    return { error: "Seznama ni bilo mogoče prebrati. Osveži stran in poskusi znova." };
  }

  const parsed = leadershipSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Seznam ni veljaven." };
  }

  const positions = { upravni: 0, nadzorni: 0 };
  const rows = parsed.data.map((person) => ({
    ...person,
    position: positions[person.body]++,
  }));

  try {
    const supabase = await createSupabaseServerClient();
    const { data: existing, error: loadError } = await supabase
      .from("leadership")
      .select("id");
    if (loadError) throw loadError;

    const keep = new Set(rows.map((row) => row.id).filter(Boolean));
    const removed = (existing ?? []).map((row) => row.id).filter((id) => !keep.has(id));

    if (removed.length > 0) {
      const { error } = await supabase.from("leadership").delete().in("id", removed);
      if (error) throw error;
    }

    const updates = rows.filter((row) => row.id);
    // Novim osebam id določi baza; nedoločen ključ se v JSON-u ne pošlje.
    const inserts = rows.filter((row) => !row.id);

    if (updates.length > 0) {
      const { error } = await supabase.from("leadership").upsert(
        updates.map((row) => ({ ...row, id: row.id! })),
      );
      if (error) throw error;
    }

    if (inserts.length > 0) {
      const { error } = await supabase.from("leadership").insert(inserts);
      if (error) throw error;
    }
  } catch (error) {
    console.error("Napaka pri shranjevanju vodstva", error);
    return { error: "Vodstva ni bilo mogoče shraniti. Poskusi znova." };
  }

  revalidatePath("/vodstvo");
  revalidatePath("/o-nas/vodstvo");
  revalidatePath("/o-nas/kontakt");

  return { success: "Shranjeno. Spremembe so že na spletni strani." };
}
