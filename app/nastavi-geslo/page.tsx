import Image from "next/image";
import { redirect } from "next/navigation";

import { SetPasswordForm } from "@/components/forms/set-password-form";
import { getCurrentUser } from "@/lib/auth";
import { appName, club } from "@/lib/constants";
import { appRoleLabels } from "@/lib/roles";

/**
 * Nastavitev gesla po sprejemu povabila.
 *
 * Sejo je vzpostavil /auth/confirm; brez nje tu ni kaj nastavljati, zato
 * obiskovalca pošljemo na prijavo.
 */
export default async function SetPasswordPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="login-canvas relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="login-orb login-orb-1" aria-hidden />
      <div className="login-orb login-orb-2" aria-hidden />

      <div className="login-card relative w-full max-w-md rounded-[22px] p-8 sm:p-10">
        <Image
          src="/nsk-logo.svg"
          alt={club.name}
          width={352}
          height={66}
          priority
          className="h-7 w-auto"
        />

        <h1 className="mt-7 font-heading text-3xl font-semibold tracking-[-0.025em] text-[#1d1d1f]">
          Nastavi geslo
        </h1>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-[#6e6e73]">
          Dobrodošel_a v {appName}u. Prijavljen_a si kot{" "}
          <strong className="text-[#1d1d1f]">{user.email}</strong> z vlogo{" "}
          {appRoleLabels[user.role].toLowerCase()}. Nastavi si geslo in začni.
        </p>

        <div className="mt-8">
          <SetPasswordForm />
        </div>
      </div>
    </main>
  );
}
