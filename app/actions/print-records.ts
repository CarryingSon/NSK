"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { printRecordSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalId(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

export async function createPrintRecordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = printRecordSchema.safeParse({
    member_id: getOptionalId(formData, "member_id") ?? null,
    title: getStringValue(formData, "title"),
    quantity: getStringValue(formData, "quantity"),
    notes: getStringValue(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Shranjevanje evidence tiska ni uspelo.",
    };
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("print_records").insert(parsed.data);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Napaka pri shranjevanju evidence tiska", error);
    return {
      error: "Zapisa tiska ni bilo mogoče shraniti. Preveri Supabase povezavo.",
    };
  }

  revalidatePath("/print-records");

  return {
    success: "Zapis tiska je bil uspešno dodan.",
  };
}

export async function deletePrintRecordAction(formData: FormData) {
  const id = getOptionalId(formData, "id");

  if (!id) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    await supabase.from("print_records").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju evidence tiska", error);
  }

  revalidatePath("/print-records");
}
