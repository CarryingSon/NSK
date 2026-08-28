"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { appRoleLabels, isAppRole, type AppRole } from "@/lib/roles";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isUserManagementConfigured } from "@/lib/supabase/env";
import { inviteUserSchema, userRoleSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const notConfigured =
  "Upravljanje uporabnikov ni nastavljeno. Dodaj SUPABASE_SERVICE_ROLE_KEY med spremenljivke okolja.";

/**
 * Povabi novega uporabnika.
 *
 * Vlogo zapišemo v app_metadata, ne v user_metadata: prvo lahko piše samo
 * service_role ključ, drugo pa uporabnik sam - in vloga, ki si jo lahko
 * nastaviš sam, ni vloga.
 */
export async function inviteUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = inviteUserSchema.safeParse({
    email: getStringValue(formData, "email"),
    role: getStringValue(formData, "role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Povabila ni bilo mogoče poslati." };
  }

  if (!isUserManagementConfigured()) {
    return { error: notConfigured };
  }

  try {
    await requireAdmin();
    const admin = createSupabaseAdminClient();

    const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      data: { role: parsed.data.role },
      redirectTo: `${getSiteUrl()}/auth/confirm?next=/nastavi-geslo`,
    });

    if (error) {
      // Povabilo obstoječemu računu Supabase zavrne; to ni napaka nastavitev.
      if (error.message.toLowerCase().includes("already been registered")) {
        return {
          error: `${parsed.data.email} ima račun že ustvarjen. Vlogo mu spremeni v seznamu spodaj.`,
        };
      }

      console.error("Napaka pri pošiljanju povabila", error);

      return {
        error: `Povabila ni bilo mogoče poslati: ${error.message}`,
      };
    }

    // inviteUserByEmail vlogo zapiše v user_metadata, mi pa jo hočemo v
    // app_metadata, kamor uporabnik ne more seči. Zato jo takoj prepišemo.
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const invited = list?.users.find(
      (user) => user.email?.toLowerCase() === parsed.data.email.toLowerCase(),
    );

    if (invited) {
      await admin.auth.admin.updateUserById(invited.id, {
        app_metadata: { role: parsed.data.role },
      });
    }

    revalidatePath("/settings");

    return {
      success: `Povabilo je poslano na ${parsed.data.email}. Vloga: ${appRoleLabels[parsed.data.role as AppRole]}.`,
    };
  } catch (error) {
    console.error("Napaka pri povabilu uporabnika", error);
    return { error: "Povabila ni bilo mogoče poslati. Poskusi znova." };
  }
}

export async function setUserRoleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = userRoleSchema.safeParse({
    id: getStringValue(formData, "id"),
    role: getStringValue(formData, "role"),
  });

  if (!parsed.success) {
    return { error: "Vloge ni bilo mogoče spremeniti." };
  }

  if (!isUserManagementConfigured()) {
    return { error: notConfigured };
  }

  try {
    const current = await requireAdmin();

    // Administrator si vloge ne more znižati sam - sicer bi se lahko zaklenil
    // iz nastavitev in vloge ne bi imel kdo vrniti nazaj.
    if (current?.id === parsed.data.id && parsed.data.role !== "admin") {
      return { error: "Sebi ne moreš odvzeti administratorske vloge." };
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.updateUserById(parsed.data.id, {
      app_metadata: { role: parsed.data.role },
    });

    if (error) {
      throw error;
    }

    revalidatePath("/settings");

    return {
      success: `Vloga je spremenjena v ${appRoleLabels[parsed.data.role as AppRole]}. Uveljavi se ob naslednji prijavi uporabnika.`,
    };
  } catch (error) {
    console.error("Napaka pri spremembi vloge", error);
    return { error: "Vloge ni bilo mogoče spremeniti." };
  }
}

export async function resendInviteAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = getStringValue(formData, "email").trim();
  const role = getStringValue(formData, "role");

  if (!email || !isAppRole(role)) {
    return { error: "Povabila ni bilo mogoče poslati." };
  }

  if (!isUserManagementConfigured()) {
    return { error: notConfigured };
  }

  try {
    await requireAdmin();
    const admin = createSupabaseAdminClient();

    // Za še nepotrjen račun je ponovno povabilo pravi klic; generateLink bi
    // ustvaril povezavo, ki je ne bi nihče poslal.
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: `${getSiteUrl()}/auth/confirm?next=/nastavi-geslo`,
    });

    if (error) {
      return { error: `Povabila ni bilo mogoče poslati: ${error.message}` };
    }

    revalidatePath("/settings");

    return { success: `Povabilo je znova poslano na ${email}.` };
  } catch (error) {
    console.error("Napaka pri ponovnem povabilu", error);
    return { error: "Povabila ni bilo mogoče poslati." };
  }
}

export async function deleteUserAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    return;
  }

  try {
    const current = await requireAdmin();

    if (current?.id === id) {
      return;
    }

    if (!isUserManagementConfigured()) {
      return;
    }

    const admin = createSupabaseAdminClient();
    await admin.auth.admin.deleteUser(id);
  } catch (error) {
    console.error("Napaka pri brisanju uporabnika", error);
  }

  revalidatePath("/settings");
}
