"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { memberSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalId(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

export async function saveMemberAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = memberSchema.safeParse({
    id: getOptionalId(formData, "id"),
    first_name: getStringValue(formData, "first_name"),
    last_name: getStringValue(formData, "last_name"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    birth_date: getStringValue(formData, "birth_date"),
    address: getStringValue(formData, "address"),
    postal_code: getStringValue(formData, "postal_code"),
    city: getStringValue(formData, "city"),
    membership_status: getStringValue(formData, "membership_status"),
    membership_year: getStringValue(formData, "membership_year"),
    membership_paid: formData.get("membership_paid") === "on",
    membership_fee: getStringValue(formData, "membership_fee"),
    joined_at: getStringValue(formData, "joined_at"),
    notes: getStringValue(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Shranjevanje člana ni uspelo.",
    };
  }

  const payload = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();

    if (parsed.data.id) {
      const { error } = await supabase
        .from("members")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw error;
      }

      revalidatePath(`/members/${parsed.data.id}`);
      revalidatePath("/members");
      redirect(`/members/${parsed.data.id}`);
    }

    const { data, error } = await supabase
      .from("members")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    revalidatePath("/members");
    redirect(data?.id ? `/members/${data.id}` : "/members");
  } catch (error) {
    console.error("Napaka pri shranjevanju člana", error);
    return {
      error:
        "Shranjevanje člana ni uspelo. Preveri, ali je e-pošta že uporabljena in ali je Supabase pravilno nastavljen.",
    };
  }
}

export async function deleteMemberAction(formData: FormData) {
  const id = getOptionalId(formData, "id");

  if (!id) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    await supabase.from("members").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju člana", error);
  }

  revalidatePath("/members");
}
