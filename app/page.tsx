import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getLandingPath } from "@/lib/roles";

// Vmesna plast (proxy.ts) neprijavljene s korenske poti preusmeri na /login, zato
// se do sem prebijejo le prijavljeni. Kam gredo naprej, je odvisno od vloge:
// uradnik nadzorne plošče ne vidi in bi ga ta takoj odbila nazaj.
export default async function HomePage() {
  const user = await getCurrentUser();

  redirect(getLandingPath(user?.role ?? "admin"));
}
