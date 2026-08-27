"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PRINT_QUOTA_KEY } from "@/lib/data";
import {
  monthRange,
  parseMonthParam,
  startOfCurrentMonth,
  toMonthParam,
} from "@/lib/format";
import { printCopiesSchema, printQuotaSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalId(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

// --- Mesečna poraba kopij ---------------------------------------------------

function parseCopies(formData: FormData, sign: 1 | -1) {
  const parsed = printCopiesSchema.safeParse({
    member_id: getOptionalId(formData, "member_id") ?? "",
    quantity: getStringValue(formData, "quantity"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Vnos ni veljaven." };
  }

  return {
    row: {
      member_id: parsed.data.member_id,
      quantity: parsed.data.quantity * sign,
      title: sign === 1 ? "Kopije" : "Popravek",
      notes: parsed.data.note ?? null,
    },
  };
}

async function writeCopies(formData: FormData, sign: 1 | -1): Promise<ActionState> {
  const parsed = parseCopies(formData, sign);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("print_records").insert(parsed.row);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Napaka pri beleženju kopij", error);
    return { error: "Zapisa ni bilo mogoče shraniti. Poskusi znova." };
  }

  revalidatePath("/print-records");

  return {
    success:
      sign === 1
        ? `Dodanih ${parsed.row.quantity} kopij.`
        : `Odštetih ${Math.abs(parsed.row.quantity)} kopij.`,
  };
}

export async function addPrintCopiesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return writeCopies(formData, 1);
}

export async function adjustPrintCopiesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return writeCopies(formData, -1);
}

// Odstrani vse zapise izbranega člana v izbranem mesecu - s tem izgine iz
// mesečnega pregleda. Zapisov drugih mesecev se ne dotakne.
export async function deleteMemberPrintMonthAction(formData: FormData) {
  const memberId = getOptionalId(formData, "member_id");
  const monthParam = getStringValue(formData, "month");

  if (!memberId) {
    return;
  }

  const month = parseMonthParam(monthParam);

  // Skrit gumb ni zaščita: pretekli meseci so poročila, zato brisanje zavrnemo
  // tudi, če zahteva pride mimo vmesnika.
  if (toMonthParam(month) !== toMonthParam(startOfCurrentMonth())) {
    console.warn("Zavrnjen poskus brisanja preteklega meseca", monthParam);
    return;
  }

  const { start, end } = monthRange(month);

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    await supabase
      .from("print_records")
      .delete()
      .eq("member_id", memberId)
      .gte("created_at", start.toISOString())
      .lt("created_at", end.toISOString());
  } catch (error) {
    console.error("Napaka pri brisanju mesečne porabe", error);
  }

  revalidatePath("/print-records");
}

export async function setPrintQuotaAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = printQuotaSchema.safeParse({
    quota: getStringValue(formData, "quota"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Kvota ni veljavna." };
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        {
          key: PRINT_QUOTA_KEY,
          value: String(parsed.data.quota),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Napaka pri shranjevanju kvote", error);
    return { error: "Kvote ni bilo mogoče shraniti. Poskusi znova." };
  }

  revalidatePath("/print-records");
  revalidatePath("/settings");

  return { success: `Kvota je nastavljena na ${parsed.data.quota} kopij na člana.` };
}
