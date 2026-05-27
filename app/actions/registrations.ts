"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registrationSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalId(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

export async function saveRegistrationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registrationSchema.safeParse({
    id: getOptionalId(formData, "id"),
    member_id: getStringValue(formData, "member_id"),
    event_id: getStringValue(formData, "event_id"),
    status: getStringValue(formData, "status"),
    notes: getStringValue(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Shranjevanje prijave ni uspelo.",
    };
  }

  const payload = parsed.data.id
    ? parsed.data
    : {
        ...parsed.data,
        registered_at: new Date().toISOString(),
      };

  try {
    const supabase = await createSupabaseServerClient();

    if (parsed.data.id) {
      const { error } = await supabase
        .from("event_registrations")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("event_registrations").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/registrations");
    revalidatePath("/dashboard");
    redirect("/registrations");
  } catch (error) {
    console.error("Napaka pri shranjevanju prijave", error);
    return {
      error:
        "Shranjevanje prijave ni uspelo. Preveri, ali je član že prijavljen na izbran dogodek.",
    };
  }
}

export async function deleteRegistrationAction(formData: FormData) {
  const id = getOptionalId(formData, "id");

  if (!id) {
    return;
  }

  try {
    const supabase = await createSupabaseServerClient();
    await supabase.from("event_registrations").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju prijave", error);
  }

  revalidatePath("/registrations");
  revalidatePath("/dashboard");
}
