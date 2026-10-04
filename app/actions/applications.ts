"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { requireUser } from "@/lib/auth";
import { club } from "@/lib/constants";
import { escapeHtml } from "@/lib/email-content";
import { sendEmail, type EmailAttachment } from "@/lib/email";
import { hasSosConsent } from "@/lib/membership";
import { sendWelcomeEmail } from "@/lib/welcome";
import {
  buildDeclarationPdf,
  declarationFileName,
} from "@/lib/pristopna-izjava";
import { registerMemberWithSos } from "@/lib/sos";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { applicationSchema, applicationStatusSchema } from "@/lib/validation";
import type { ActionState } from "@/types/app";
import type { Database } from "@/types/database";

type ApplicationUpdate =
  Database["public"]["Tables"]["membership_applications"]["Update"];

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

// Podpis s platna je PNG v data URL. Velikost omejimo, ker gre skozi strežniško
// akcijo; običajen podpis ima nekaj deset kB.
const maxSignatureBytes = 300 * 1024;

function parseSignature(value: string) {
  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(value);

  if (!match) {
    return null;
  }

  const bytes = Buffer.from(match[1], "base64");
  const isPng = bytes.subarray(0, 8).equals(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );

  return isPng && bytes.length <= maxSignatureBytes ? new Uint8Array(bytes) : null;
}

/** Potrdilo_o_vpisu_Ime_Priimek.pdf - končnica ostane, kot jo je imela datoteka. */
function proofFileName(firstName: string, lastName: string, original: string) {
  const extension = /\.([a-z0-9]{1,5})$/i.exec(original)?.[1]?.toLowerCase() ?? "pdf";
  const name = `${firstName} ${lastName}`
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_");

  return `Potrdilo_o_vpisu_${name}.${extension}`;
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
    municipality: getStringValue(formData, "municipality"),
    privacy_acknowledged: formData.get("privacy_acknowledged"),
    sos_consent: formData.get("sos_consent"),
    media_consent: formData.get("media_consent"),
    newsletter_consent: formData.get("newsletter_consent"),
    notifications_accepted: formData.get("notifications_accepted"),
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

  const signature = parseSignature(getStringValue(formData, "signature"));

  if (!signature) {
    return { error: "Pred oddajo se podpiši v polje za podpis." };
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

    const signaturePath = `podpisi/${new Date().getFullYear()}/${crypto.randomUUID()}.png`;
    const { error: signatureError } = await supabase.storage
      .from(proofBucket)
      .upload(signaturePath, signature, { contentType: "image/png", upsert: false });

    if (signatureError) {
      console.error("Napaka pri shranjevanju podpisa", signatureError);
      return { error: "Podpisa ni bilo mogoče shraniti. Poskusi znova." };
    }

    // Soglasja se ob oddaji samo zapišejo. V ŠOS gre prijava šele, ko jo klub
    // odobri - glej setApplicationStatusAction().
    const submittedAt = new Date();
    const { error } = await supabase.from("membership_applications").insert({
      ...parsed.data,
      proof_path: proofPath,
      signature_path: signaturePath,
      status: "pending",
    });

    if (error) {
      throw error;
    }

    // Izjava gre klubu šele po odgovoru, da prijavitelj ne čaka na SMTP.
    // Prijava je takrat že shranjena, zato je neuspelo pošiljanje ne podre.
    const application = parsed.data;
    // Datoteko preberemo zdaj: po odgovoru telo zahteve ni več zagotovo na voljo.
    const proofAttachment: EmailAttachment | null = hasProof
      ? {
          filename: proofFileName(application.first_name, application.last_name, proof.name),
          content: Buffer.from(await proof.arrayBuffer()),
          contentType: proof.type,
        }
      : null;

    after(() =>
      sendDeclarationToClub(application, submittedAt, proofAttachment, signature),
    );

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

type ParsedApplication = Extract<
  ReturnType<typeof applicationSchema.safeParse>,
  { success: true }
>["data"];

/**
 * Pošlje izpolnjeno pristopno izjavo in potrdilo o vpisu na klubski naslov.
 *
 * Klub mora izjavo hraniti tudi za člane, ki se včlanijo na spletu - to je
 * njihova različica papirja, ki ga drugi podpišejo za pultom. Prijavitelju je
 * ne pošiljamo: vsebuje EMŠO, e-pošta pa ni prostor zanj, kadar ni nujno.
 *
 * Nikoli ne vrže; napako samo zapiše v dnevnik.
 */
async function sendDeclarationToClub(
  application: ParsedApplication,
  submittedAt: Date,
  proof: EmailAttachment | null,
  signature: Uint8Array,
) {
  try {
    const pdf = await buildDeclarationPdf({
      firstName: application.first_name,
      lastName: application.last_name,
      emso: application.emso,
      address: application.address,
      postalCode: application.postal_code,
      city: application.city,
      municipality: application.municipality,
      phone: application.phone,
      email: application.email,
      memberType: application.member_type,
      sosConsent: application.sos_consent,
      mediaConsent: application.media_consent,
      newsletterConsent: application.newsletter_consent,
      signaturePng: signature,
      submittedAt,
    });

    const name = `${application.first_name} ${application.last_name}`;
    const memberType = application.member_type === "pupil" ? "dijak/-inja" : "študent/-ka";
    const proofLine = proof
      ? "V priponki sta pristopna izjava in potrdilo o vpisu."
      : "V priponki je pristopna izjava. Potrdila o vpisu ni naložil_a - prinesti ga mora v času uradnih ur.";

    const result = await sendEmail({
      to: club.email,
      subject: `Pristopna izjava: ${name}`,
      replyTo: application.email,
      log: { kind: "izjava", recipientName: name },
      text: [
        `Nova spletna prijava v ${club.shortName}: ${name} (${memberType}, ${application.school}).`,
        proofLine,
        "Prijavo odobriš v Požiralniku pod Prijave.",
      ].join("\n\n"),
      html: `<p>Nova spletna prijava v ${club.shortName}: <strong>${escapeHtml(name)}</strong> (${memberType}, ${escapeHtml(application.school)}).</p>
<p>${proofLine}</p>
<p>Prijavo odobriš v Požiralniku pod Prijave.</p>`,
      attachments: [
        {
          filename: declarationFileName(application.first_name, application.last_name),
          content: pdf,
          contentType: "application/pdf",
        },
        ...(proof ? [proof] : []),
      ],
    });

    if (!result.success) {
      console.error("Pristopne izjave ni bilo mogoče poslati", result.error);
    }
  } catch (error) {
    console.error("Napaka pri sestavljanju pristopne izjave", error);
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

    const update: ApplicationUpdate = {
      status: parsed.data.status,
      // "V obdelavi" pomeni, da prijava spet čaka, zato sled o obdelavi pobrišemo.
      processed_at:
        parsed.data.status === "pending" ? null : new Date().toISOString(),
      processed_by: parsed.data.status === "pending" ? null : user?.email ?? null,
    };

    if (parsed.data.status === "approved") {
      Object.assign(update, await registerApprovedApplication(supabase, parsed.data.id));
    }

    await supabase
      .from("membership_applications")
      .update(update)
      .eq("id", parsed.data.id);
  } catch (error) {
    console.error("Napaka pri spremembi stanja prijave", error);
  }

  revalidatePath("/applications");
}

/**
 * Ob odobritvi prijavo posreduje v sistem študentskih klubov.
 *
 * Odobritev je trenutek, ko klub za prijavo jamči - zato gre v skupni sistem
 * šele tu in ne že ob oddaji obrazca. Član nato prejme e-pošto s kodo, ki jo
 * sam vnese na studentski-klubi.si; tega koraka klub ne more opraviti zanj.
 *
 * Vrne samo polja, ki jih je treba dopisati k posodobitvi. Nikoli ne vrže:
 * odobritev prijave ne sme pasti zato, ker je tuj sistem nedosegljiv.
 *
 * Ponovna odobritev že poslane prijave ne pošlje nič - sos_registered_at je
 * zapora. Če je prejšnji poskus spodletel, jo "V obdelavo" in znova "Odobri"
 * pošljeta še enkrat; podvojitev prepreči ŠOS sam, ker je e-pošta pri njih enolična.
 */
async function registerApprovedApplication(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  id: string,
): Promise<ApplicationUpdate> {
  const { data: application, error } = await supabase
    .from("membership_applications")
    .select(
      "first_name, last_name, emso, email, postal_code, sos_consent, terms_accepted, notifications_accepted, sos_registered_at",
    )
    .eq("id", id)
    .single();

  if (error || !application) {
    return {};
  }

  // Že poslano ali brez soglasja - ne pošiljamo in ne pišemo napake.
  if (application.sos_registered_at || !hasSosConsent(application)) {
    return {};
  }

  // ŠOS zahteva EMŠO. Prijavnica ga terja, starejši zapisi pa ga lahko nimajo.
  if (!application.emso) {
    return {
      sos_error: "Prijava nima vpisanega EMŠO, ki ga sistem ŠOS zahteva.",
    };
  }

  const sos = await registerMemberWithSos({
    firstName: application.first_name,
    lastName: application.last_name,
    emso: application.emso,
    email: application.email,
    postalCode: application.postal_code,
    notificationsAccepted: application.notifications_accepted,
  });

  if (sos.ok) {
    return { sos_registered_at: new Date().toISOString(), sos_error: null };
  }

  return { sos_error: sos.error };
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
        // Pristopna izjava vpraša po e-novicah. Kdor ni soglašal, jih ne dobi;
        // starejše prijave tega vprašanja niso imele, zato zanje ne odločamo.
        ...(application.privacy_acknowledged && !application.newsletter_consent
          ? {
              notifications_opt_out: true,
              notifications_opt_out_at: application.created_at,
            }
          : {}),
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

    // Pozdrav gre po odgovoru, da aktivist ne čaka na SMTP.
    after(() =>
      sendWelcomeEmail({
        email: application.email,
        firstName: application.first_name,
        memberId: member.id,
        sosPending: Boolean(application.sos_registered_at),
      }),
    );

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
      .select("proof_path, signature_path")
      .eq("id", id)
      .single();

    const files = [application?.proof_path, application?.signature_path].filter(
      (path): path is string => Boolean(path),
    );

    if (files.length > 0) {
      await supabase.storage.from(proofBucket).remove(files);
    }

    await supabase.from("membership_applications").delete().eq("id", id);
  } catch (error) {
    console.error("Napaka pri brisanju prijave", error);
  }

  revalidatePath("/applications");
}
