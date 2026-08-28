const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpSecure = process.env.SMTP_SECURE;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM;
const smtpReplyTo = process.env.SMTP_REPLY_TO;
// Service role ključ obide vsa RLS pravila, zato namenoma ni NEXT_PUBLIC in se
// uporablja izključno v strežniških akcijah za upravljanje uporabnikov.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseCredentials() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase ni konfiguriran. Nastavi NEXT_PUBLIC_SUPABASE_URL in NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

export function isUserManagementConfigured() {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}

export function getServiceRoleCredentials() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Upravljanje uporabnikov ni konfigurirano. Nastavi SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { supabaseUrl, supabaseServiceRoleKey };
}

export function isEmailConfigured() {
  return Boolean(smtpHost && smtpPort && smtpUser && smtpPass && smtpFrom);
}

export function getEmailCredentials() {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    throw new Error(
      "Email povezava ni konfigurirana. Nastavi SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in SMTP_FROM.",
    );
  }

  return {
    smtpHost,
    smtpPort: Number(smtpPort),
    smtpSecure: smtpSecure === "true",
    smtpUser,
    smtpPass,
    smtpFrom,
    smtpReplyTo: smtpReplyTo || undefined,
  };
}
