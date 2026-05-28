"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { eventSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function getOptionalId(formData: FormData, key: string) {
  const value = getStringValue(formData, key).trim();
  return value.length > 0 ? value : undefined;
}

export async function saveEventAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = eventSchema.safeParse({
    id: getOptionalId(formData, "id"),
    title: getStringValue(formData, "title"),
    description: getStringValue(formData, "description"),
    location: getStringValue(formData, "location"),
    starts_at: getStringValue(formData, "starts_at"),
    ends_at: getStringValue(formData, "ends_at"),
    max_attendees: getStringValue(formData, "max_attendees"),
    status: getStringValue(formData, "status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Shranjevanje dogodka ni uspelo.",
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
        .from("events")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) throw error;
    }

    revalidatePath("/events");
    revalidatePath("/dashboard");
    redirect("/events");
  } catch (error) {
    console.error("Napaka pri shranjevanju dogodka", error);
    return {
      error:
        "Shranjevanje dogodka ni uspelo. Preveri datume in Supabase povezavo.",
    };
  }
}

export async function deleteEventAction(formData: FormData) {
  const id = getOptionalId(formData, "id");

  if (!id) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    await supabase.from("events").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju dogodka", error);
  }

  revalidatePath("/events");
  revalidatePath("/dashboard");
}
