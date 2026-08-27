import { redirect } from "next/navigation";

// Vmesna plast (proxy.ts) neprijavljene s korenske poti preusmeri na /login, zato
// se do sem prebijejo le prijavljeni. Preverjanje identitete tu bi bil zgolj še
// en omrežni obhod za preusmeritev, ki je vnaprej znana.
export default function HomePage() {
  redirect("/dashboard");
}
