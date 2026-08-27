"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { buildCampaignEmailHtml, sendEmail } from "@/lib/email";
import { richTextToPlainText } from "@/lib/email-content";
import {
  createCampaign,
  dispatchCampaignBatch,
  requeueFailed,
} from "@/lib/notifications";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { campaignSchema, testEmailSchema } from "@/lib/validation";
import type { ActionState, DispatchBatchResult } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readCampaignFields(formData: FormData) {
  return {
    title: getStringValue(formData, "title"),
    subtitle: getStringValue(formData, "subtitle"),
    content: getStringValue(formData, "content"),
    ctaLabel: getStringValue(formData, "cta_label"),
    ctaUrl: getStringValue(formData, "cta_url"),
    campaignType: getStringValue(formData, "campaign_type"),
    audience: getStringValue(formData, "audience"),
    dailyLimit: getStringValue(formData, "daily_limit"),
  };
}

// Kampanjo samo ustvarimo in napolnimo vrsto. Pošiljanje teče v serijah prek
// dispatchCampaignBatchAction, ker bi tisoč sporočil v eni zahtevi preseglo
// časovno omejitev strežniške funkcije.
export async function createCampaignAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = campaignSchema.safeParse(readCampaignFields(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Obvestila ni bilo mogoče ustvariti.",
    };
  }

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    const result = await createCampaign(supabase, {
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      contentHtml: parsed.data.content,
      ctaLabel: parsed.data.ctaLabel,
      ctaUrl: parsed.data.ctaUrl,
      campaignType: parsed.data.campaignType,
      audience: parsed.data.audience,
      dailyLimit: parsed.data.dailyLimit,
      createdBy: user?.email ?? null,
    });

    if (!result.campaignId) {
      return {
        error: "Za izbrano občinstvo trenutno ni članov z veljavno e-pošto.",
      };
    }

    revalidatePath("/notifications");
    revalidatePath("/notifications/history");

    return {
      success: `Obvestilo je v čakalni vrsti za ${result.recipients} prejemnikov. Pošiljanje spremljaš v zgodovini obvestil.`,
    };
  } catch (error) {
    console.error("Napaka pri ustvarjanju kampanje", error);

    return {
      error: "Obvestila ni bilo mogoče uvrstiti v vrsto. Preveri Supabase povezavo.",
    };
  }
}

// Test gre na en sam naslov in se ne zapiše v zgodovino - namenjen je pregledu
// postavitve pred pošiljanjem članom.
export async function sendTestEmailAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsedEmail = testEmailSchema.safeParse({
    testEmail: getStringValue(formData, "test_email"),
  });

  if (!parsedEmail.success) {
    return {
      error: parsedEmail.error.issues[0]?.message ?? "Testni naslov ni veljaven.",
    };
  }

  const parsed = campaignSchema.safeParse(readCampaignFields(formData));

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Vsebine ni bilo mogoče pripraviti.",
    };
  }

  try {
    await requireUser();

    const html = buildCampaignEmailHtml({
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      contentHtml: parsed.data.content,
      ctaLabel: parsed.data.ctaLabel,
      ctaUrl: parsed.data.ctaUrl,
      campaignType: parsed.data.campaignType,
    });

    const delivery = await sendEmail({
      to: parsedEmail.data.testEmail,
      subject: `[TEST] ${parsed.data.title}`,
      html,
      text: richTextToPlainText(parsed.data.content),
    });

    if (!delivery.success) {
      return { error: `Testno sporočilo ni bilo poslano: ${delivery.error}` };
    }

    return { success: `Testno sporočilo je poslano na ${parsedEmail.data.testEmail}.` };
  } catch (error) {
    console.error("Napaka pri testnem pošiljanju", error);

    return { error: "Testnega sporočila ni bilo mogoče poslati. Preveri SMTP nastavitve." };
  }
}

// Kliče jo napredek na strani zgodovine, dokler ni `done` ali dokler ni
// dosežena dnevna omejitev.
export async function dispatchCampaignBatchAction(
  campaignId: string,
): Promise<DispatchBatchResult & { error?: string }> {
  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    // Brez revalidatePath: serije se vrstijo hitro druga za drugo, osvežitev
    // strani po vsaki bi po nepotrebnem ponovno izrisala celotno zgodovino.
    // Stran se osveži, ko se pošiljanje ustavi.
    return await dispatchCampaignBatch(supabase, campaignId);
  } catch (error) {
    console.error("Napaka pri pošiljanju serije", error);

    return {
      sent: 0,
      failed: 0,
      pending: 0,
      done: false,
      dailyLimitReached: false,
      message: "Serije ni bilo mogoče poslati.",
      error: "Serije ni bilo mogoče poslati. Preveri SMTP in Supabase nastavitve.",
    };
  }
}

export async function setCampaignPausedAction(formData: FormData) {
  const campaignId = getStringValue(formData, "campaign_id");
  const paused = getStringValue(formData, "paused") === "true";

  if (!campaignId) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();

    await supabase
      .from("email_campaigns")
      .update({ status: paused ? "paused" : "queued" })
      .eq("id", campaignId);
  } catch (error) {
    console.error("Napaka pri spremembi stanja kampanje", error);
  }

  revalidatePath("/notifications/history");
}

export async function requeueFailedAction(formData: FormData) {
  const campaignId = getStringValue(formData, "campaign_id");

  if (!campaignId) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();
    await requeueFailed(supabase, campaignId);
  } catch (error) {
    console.error("Napaka pri vračanju neuspelih naslovov v vrsto", error);
  }

  revalidatePath("/notifications/history");
}

export async function deleteCampaignAction(formData: FormData) {
  const campaignId = getStringValue(formData, "campaign_id");

  if (!campaignId) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();

    // Vrstice v čakalni vrsti odnese kaskada na tuji ključ.
    await supabase.from("email_campaigns").delete().eq("id", campaignId);
  } catch (error) {
    console.error("Napaka pri brisanju kampanje", error);
  }

  revalidatePath("/notifications/history");
  revalidatePath("/notifications");
}
