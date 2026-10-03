import type { Metadata } from "next";

import { NaslovStrani } from "@/components/javna/naslov-strani";
import { klub } from "@/lib/klub";

export const metadata: Metadata = {
  title: "Izjava o dostopnosti",
  description:
    "Izjava o dostopnosti spletišča Notranjskega študentskega kluba po Zakonu o dostopnosti spletišč in mobilnih aplikacij.",
};

// Izjava mora opisovati dejansko stanje strani, ne želenega. Ob vsaki večji
// predelavi strani je treba samooceno ponoviti in ta datum popraviti - stara
// izjava je na primer navajala iskalno polje in meni "Dostopnost", ki ju ta
// stran nima.
const POSODOBLJENO = "17. 9. 2026";

export default function SkladnostStran() {
  return (
    <>
      <NaslovStrani
        naslov="Izjava o dostopnosti"
        opis="Skladnost spletišča z Zakonom o dostopnosti spletišč in mobilnih aplikacij (ZDSMA)."
      />

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-10 text-[0.9375rem] leading-relaxed">
          <div>
            <p>
              {klub.ime} se zavezuje omogočati dostopnost svojega spletišča v
              skladu z Zakonom o dostopnosti spletišč in mobilnih aplikacij.
              Ta izjava se nanaša na celotno spletišče nsk-klub.si.
            </p>
          </div>

          <div>
            <h2 className="display-md">Stopnja skladnosti</h2>
            <p className="mt-4">
              Ocenjujemo, da je spletišče delno skladno z Zakonom o dostopnosti
              spletišč in mobilnih aplikacij, in sicer zaradi izjem, navedenih
              spodaj pod Nedostopna vsebina.
            </p>
            <p className="mt-4">
              Pri objavljanju vsebin sledimo smernicam Web Content Accessibility
              Guidelines (WCAG). V praksi to pomeni:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>vsebina je strukturirana z zaporednimi ravnmi naslovov;</li>
              <li>slike, ki nosijo informacijo, imajo nadomestno besedilo;</li>
              <li>
                besedilo je mogoče povečati z brskalnikom (ctrl oziroma cmd s
                plus in minus) brez izgube vsebine ali strukture;
              </li>
              <li>vse vsebine so dosegljive s tipkovnico;</li>
              <li>na vrhu vsake strani je povezava za preskok na glavno vsebino;</li>
              <li>navigacija je na vseh straneh enaka;</li>
              <li>
                postavitev se prilagaja zaslonu, od namiznega računalnika do
                telefona;
              </li>
              <li>
                stran podpira svetlo in temno shemo in se ravna po nastavitvi
                naprave;
              </li>
              <li>vsebine niso časovno omejene in ne utripajo.</li>
            </ul>
          </div>

          <div>
            <h2 className="display-md">Nedostopna vsebina</h2>
            <p className="mt-4">
              Dostopnost spletišča spremljamo in izboljšujemo, kljub temu pa
              nekatere objavljene vsebine niso dostopne vsem:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                daljši skenirani dokumenti PDF, na primer lastnoročno podpisana
                gradiva in dokumenti, ki jih posredujejo tretje osebe;
              </li>
              <li>
                obrazci in vloge, ki morajo biti podpisani in so zato objavljeni
                kot dokument za tisk;
              </li>
              <li>
                novice iz preteklih let, ki so bile prenesene iz starega
                spletišča in niso bile pregledane po kriterijih dostopnosti;
                ostajajo kot arhivsko gradivo;
              </li>
              <li>
                videoposnetki, objavljeni prek drugih spletišč, nimajo
                podnapisov in njihovo krmiljenje ni v naši pristojnosti.
              </li>
            </ul>
            <p className="mt-4">
              Naštete vsebine so izvzete zaradi nesorazmernega bremena. Če
              katere od njih ne moreš uporabiti, nam piši in pošljemo ti jo v
              dostopni obliki.
            </p>
          </div>

          <div>
            <h2 className="display-md">Priprava izjave</h2>
            <p className="mt-4">
              Izjava je bila pripravljena na podlagi samoocene in nazadnje
              posodobljena {POSODOBLJENO}.
            </p>
          </div>

          <div>
            <h2 className="display-md">Povratne in kontaktne informacije</h2>
            <p className="mt-4">
              Obvestilo o morebitni neskladnosti z ZDSMA ali zahtevo za
              posredovanje informacij v dostopni obliki lahko pošlješ po navadni
              ali elektronski pošti:
            </p>
            <address className="mt-4 not-italic">
              {klub.ime}
              <br />
              {klub.naslov.ulica}
              <br />
              {klub.naslov.posta}
              <br />
              <a href={`mailto:${klub.email}`} className="text-primary hover:underline">
                {klub.email}
              </a>
            </address>
            <p className="mt-4">
              Odgovor prejmeš v roku osmih dni od prejema. Če v tem roku ne bomo
              mogli podati ustreznega odgovora, ti sporočimo, kdaj bo podan in
              zakaj se je zamaknil.
            </p>
          </div>

          <div>
            <h2 className="display-md">Izvršilni postopek</h2>
            <p className="mt-4">
              Če na obvestilo ali zahtevo, poslano skladno z 8. členom Zakona o
              dostopnosti spletišč in mobilnih aplikacij, ne prejmeš
              zadovoljivega odgovora, lahko podaš prijavo inšpektorjem za
              informacijsko družbo:
            </p>
            <address className="mt-4 not-italic">
              Ministrstvo za digitalno preobrazbo
              <br />
              Inšpektorat za informacijsko družbo
              <br />
              Davčna ulica 1
              <br />
              1000 Ljubljana
              <br />
              <a href="mailto:gp.irsid@gov.si" className="text-primary hover:underline">
                gp.irsid@gov.si
              </a>
            </address>
          </div>
        </div>
      </section>
    </>
  );
}
