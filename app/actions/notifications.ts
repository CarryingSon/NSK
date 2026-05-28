"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getDeleteWindow, deliverNotificationCampaign } from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notificationSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function sendNotificationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = notificationSchema.safeParse({
    audience: getStringValue(formData, "audience"),
    subject: getStringValue(formData, "subject"),
    body: getStringValue(formData, "body"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Pošiljanje obvestila ni uspelo.",
    };
  }

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const result = await deliverNotificationCampaign({
      supabase,
      audience: parsed.data.audience,
      subject: parsed.data.subject,
      body: parsed.data.body,
      createdByEmail: user?.email ?? null,
    });

    if (result.totalCount === 0) {
      return {
        error: "Za izbrano skupino trenutno ni članov z veljavno e-pošto.",
      };
    }

    revalidatePath("/notifications");
    revalidatePath("/notifications/history");

    return {
      success: `Poslanih: ${result.successCount}/${result.totalCount}. Napak: ${result.failedCount}.`,
    };
  } catch (error) {
    console.error("Napaka pri pošiljanju obvestila", error);

    return {
      error:
        "Pošiljanje ni uspelo. Preveri SMTP povezavo in Supabase nastavitve.",
    };
  }
}

export async function deleteEmailCampaignAction(formData: FormData) {
  const subject = getStringValue(formData, "subject");
  const sentAt = getStringValue(formData, "sent_at");

  if (!subject || !sentAt) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    const { startTime, endTime } = getDeleteWindow(sentAt);

    await supabase
      .from("email_logs")
      .delete()
      .eq("subject", subject)
      .gte("created_at", startTime)
      .lte("created_at", endTime);
  } catch (error) {
    console.error("Napaka pri brisanju email kampanje", error);
  }

  revalidatePath("/notifications/history");
  revalidatePath("/notifications");
}
