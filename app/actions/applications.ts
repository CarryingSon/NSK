"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { applicationSchema, applicationStatusSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";

const proofBucket = "potrdila";
const maxProofBytes = 5 * 1024 * 1024;
const allowedProofTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
]);

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Ime datoteke gre v pot v shrambi, zato iz njega odstranimo vse, kar ni
// varno v URL-ju. Šumniki bi sicer končali kot odstotkovna zaporedja.
function toStoragePath(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase()
    : "dat";

  const safeExtension = /^[a-z0-9]{1,5}$/.test(extension) ? extension : "dat";
  const year = new Date().getFullYear();

  return `${year}/${crypto.randomUUID()}.${safeExtension}`;
}

/**
 * Oddaja javnega obrazca. Teče brez prijave - vlogo "anon" v Supabase omejuje
 * politika, ki dovoli samo vstavljanje vrstic in nalaganje v vedro potrdil.
 */
export async function submitApplicationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    first_name: getStringValue(formData, "first_name"),
    last_name: getStringValue(formData, "last_name"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    birth_date: getStringValue(formData, "birth_date"),
    emso: getStringValue(formData, "emso"),
    address: getStringValue(formData, "address"),
    postal_code: getStringValue(formData, "postal_code"),
    city: getStringValue(formData, "city"),
    school: getStringValue(formData, "school"),
    study_program: getStringValue(formData, "study_program"),
    study_year: getStringValue(formData, "study_year"),
    member_type: getStringValue(formData, "member_type"),
    message: getStringValue(formData, "message"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Prijave ni bilo mogoče oddati.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      error:
        "Prijave trenutno ni mogoče oddati. Piši nam na nsk.klub@gmail.com in uredimo ročno.",
    };
  }

  const proof = formData.get("proof");
  const hasProof = proof instanceof File && proof.size > 0;

  if (hasProof) {
    if (proof.size > maxProofBytes) {
      return { error: "Potrdilo je večje od 5 MB. Naloži manjšo datoteko." };
    }

    if (!allowedProofTypes.has(proof.type)) {
      return { error: "Potrdilo mora biti PDF ali slika (JPG, PNG, HEIC)." };
    }
  }

  try {
    const supabase = await createSupabaseServerClient();
    let proofPath: string | null = null;

    if (hasProof) {
      const path = toStoragePath(proof.name);
      const { error: uploadError } = await supabase.storage
        .from(proofBucket)
        .upload(path, proof, { contentType: proof.type, upsert: false });

      if (uploadError) {
        console.error("Napaka pri nalaganju potrdila", uploadError);
        return {
          error:
            "Potrdila ni bilo mogoče naložiti. Poskusi znova ali ga pošlji po e-pošti.",
        };
      }

      proofPath = path;
    }

    const { error } = await supabase.from("membership_applications").insert({
      ...parsed.data,
      proof_path: proofPath,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    revalidatePath("/applications");

    return {
      success:
        "Prijava je oddana. Ko jo pregledamo, se ti oglasimo po e-pošti.",
    };
  } catch (error) {
    console.error("Napaka pri oddaji prijave", error);

    return {
      error: "Prijave ni bilo mogoče oddati. Poskusi znova čez nekaj trenutkov.",
    };
  }
}

export async function setApplicationStatusAction(formData: FormData) {
  const parsed = applicationStatusSchema.safeParse({
    id: getStringValue(formData, "id"),
    status: getStringValue(formData, "status"),
  });

  if (!parsed.success) {
    return;
  }

  try {
    const user = await requireUser();
    const supabase = await createSupabaseServerClient();

    await supabase
      .from("membership_applications")
      .update({
        status: parsed.data.status,
        // "V obdelavi" pomeni, da prijava spet čaka, zato sled o obdelavi pobrišemo.
        processed_at:
          parsed.data.status === "pending" ? null : new Date().toISOString(),
        processed_by: parsed.data.status === "pending" ? null : user?.email ?? null,
      })
      .eq("id", parsed.data.id);
  } catch (error) {
    console.error("Napaka pri spremembi stanja prijave", error);
  }

  revalidatePath("/applications");
}

/**
 * Iz prijavnice ustvari člana in ju poveže. Povezava prepreči, da bi ista
 * prijava pristala v evidenci dvakrat.
 */
export async function createMemberFromApplicationAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = getStringValue(formData, "id");

  if (!id) {
    return { error: "Prijava ni bila najdena." };
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();

    const { data: application, error: loadError } = await supabase
      .from("membership_applications")
      .select("*")
      .eq("id", id)
      .single();

    if (loadError || !application) {
      return { error: "Prijava ni bila najdena." };
    }

    if (application.member_id) {
      return { error: "Ta prijava je že prenesena med člane." };
    }

    const { data: member, error: insertError } = await supabase
      .from("members")
      .insert({
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
        birth_date: application.birth_date,
        emso: application.emso,
        address: application.address,
        postal_code: application.postal_code,
        city: application.city,
        faculty: application.school,
        membership_status: "active",
        membership_year: new Date().getFullYear(),
        joined_at: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();

    if (insertError || !member) {
      // 23505 = kršitev enoličnosti; edini tak indeks na members je e-pošta.
      const code =
        insertError && typeof insertError === "object" && "code" in insertError
          ? String(insertError.code)
          : "";

      if (code === "23505") {
        return {
          error: `${application.email} je že vpisan pri drugem članu. Preveri evidenco članov.`,
        };
      }

      throw insertError ?? new Error("Člana ni bilo mogoče ustvariti.");
    }

    await supabase
      .from("membership_applications")
      .update({ member_id: member.id, status: "approved" })
      .eq("id", id);

    revalidatePath("/applications");
    revalidatePath("/members");

    return {
      success: `${application.first_name} ${application.last_name} je zdaj med člani.`,
    };
  } catch (error) {
    console.error("Napaka pri prenosu prijave med člane", error);

    return { error: "Prenosa med člane ni bilo mogoče izvesti." };
  }
}

export async function deleteApplicationAction(formData: FormData) {
  const id = getStringValue(formData, "id");

  if (!id) {
    return;
  }

  try {
    await requireUser();
    const supabase = await createSupabaseServerClient();

    // Potrdilo je osebni dokument, zato gre iz shrambe skupaj s prijavo.
    const { data: application } = await supabase
      .from("membership_applications")
      .select("proof_path")
      .eq("id", id)
      .single();

    if (application?.proof_path) {
      await supabase.storage.from(proofBucket).remove([application.proof_path]);
    }

    await supabase.from("membership_applications").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju prijave", error);
  }

  revalidatePath("/applications");
}
