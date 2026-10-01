import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import type { MemberSegment } from "@/types/database";

/**
 * Pristopna izjava, izpolnjena s podatki s spletne prijavnice.
 *
 * Za ozadje služi klubova izjava v PDF-ju (izvoz iz Google Docs), čez njo pa
 * izpišemo vrednosti. Tako je oddana izjava na las enaka papirnati in ob
 * spremembi besedila je treba zamenjati samo predlogo - in preveriti
 * koordinate spodaj, če so se vrstice premaknile.
 *
 * Koordinate so izmerjene s `pdftotext -bbox predloga.pdf -` in so v točkah od
 * zgornjega levega kota; pdf-lib šteje od spodnjega, zato jih obrnemo v top().
 *
 * Pisava je Arimo, ki ima iste mere kot Arial v predlogi in pozna šumnike -
 * vgrajene pisave PDF-ja jih ne.
 */

const assetsDir = path.join(process.cwd(), "lib", "pristopna-izjava");

export interface DeclarationInput {
  firstName: string;
  lastName: string;
  emso: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  municipality: string;
  phone?: string | null;
  email: string;
  memberType: MemberSegment;
  sosConsent: boolean;
  mediaConsent: boolean;
  newsletterConsent: boolean;
  submittedAt: Date;
}

const ink = rgb(0.05, 0.1, 0.35);
const valueSize = 11;
const valueX = 216;
const valueMaxWidth = 527 - valueX;

// Spodnji rob oznake polja v predlogi; vrednost sede na isto osnovnico.
const fieldBottoms = {
  name: 197.9,
  emso: 219.9,
  address: 242.6,
  place: 265.4,
  municipality: 288.1,
  phone: 310.9,
  email: 333.6,
} as const;

// Levi zgornji kot znaka ☐ v predlogi.
const boxes = {
  student: [203.7, 144.9],
  pupil: [317.3, 144.9],
  privacy: [72, 418.2],
  sos: [72, 464.7],
  media: [72, 529.6],
  newsletter: [72, 564.6],
} as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sl-SI", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    timeZone: "Europe/Ljubljana",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("sl-SI", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Ljubljana",
  }).format(date);
}

function drawValue(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  bottom: number,
  maxWidth: number,
  size = valueSize,
) {
  const value = text.trim();

  if (!value) {
    return;
  }

  // Dolg naslov raje pomanjšamo, kot da bi segel čez črto.
  let fitted = size;
  while (fitted > 7 && font.widthOfTextAtSize(value, fitted) > maxWidth) {
    fitted -= 0.5;
  }

  page.drawText(value, {
    x,
    y: page.getHeight() - bottom + 2.5,
    size: fitted,
    font,
    color: ink,
  });
}

function drawCross(page: PDFPage, [left, top]: readonly [number, number]) {
  const height = page.getHeight();
  const inset = 2.2;
  const x0 = left + inset;
  const x1 = left + 10 - inset;
  const y0 = height - (top + 10 - inset);
  const y1 = height - (top + inset);
  const line = { thickness: 1.3, color: ink };

  page.drawLine({ start: { x: x0, y: y0 }, end: { x: x1, y: y1 }, ...line });
  page.drawLine({ start: { x: x0, y: y1 }, end: { x: x1, y: y0 }, ...line });
}

export async function buildDeclarationPdf(input: DeclarationInput) {
  const [template, fontBytes] = await Promise.all([
    readFile(path.join(assetsDir, "predloga.pdf")),
    readFile(path.join(assetsDir, "Arimo-Regular.ttf")),
  ]);

  const pdf = await PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const page = pdf.getPage(0);

  const place = [input.postalCode, input.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  drawValue(page, font, `${input.firstName} ${input.lastName}`, valueX, fieldBottoms.name, valueMaxWidth);
  drawValue(page, font, input.emso, valueX, fieldBottoms.emso, valueMaxWidth);
  drawValue(page, font, input.address ?? "", valueX, fieldBottoms.address, valueMaxWidth);
  drawValue(page, font, place, valueX, fieldBottoms.place, valueMaxWidth);
  drawValue(page, font, input.municipality, valueX, fieldBottoms.municipality, valueMaxWidth);
  drawValue(page, font, input.phone ?? "", valueX, fieldBottoms.phone, valueMaxWidth);
  drawValue(page, font, input.email, valueX, fieldBottoms.email, valueMaxWidth);

  drawCross(page, input.memberType === "pupil" ? boxes.pupil : boxes.student);
  // Prijavnice brez tega soglasja ni mogoče oddati, zato je vedno obkljukano.
  drawCross(page, boxes.privacy);
  if (input.sosConsent) drawCross(page, boxes.sos);
  if (input.mediaConsent) drawCross(page, boxes.media);
  if (input.newsletterConsent) drawCross(page, boxes.newsletter);

  // Kraj podpisa pri spletni oddaji ne obstaja - zapišemo, kje je bila oddana.
  drawValue(page, font, `splet, ${formatDate(input.submittedAt)}`, 152, 669.7, 148);

  // Lastnoročnega podpisa ni; namesto njega zapis o elektronski oddaji. Podpis
  // aktivista, žig, interna številka in vnos v ŠOS ostanejo za klub.
  const signatureNote = `Oddano elektronsko ${formatDate(input.submittedAt)} ob ${formatTime(input.submittedAt)}`;
  const noteSize = 8;
  const noteWidth = font.widthOfTextAtSize(signatureNote, noteSize);
  drawValue(page, font, signatureNote, 447.5 - noteWidth / 2, 674, 159, noteSize);

  return Buffer.from(await pdf.save());
}

/** Ime priponke: Pristopna_izjava_Ime_Priimek.pdf, kot jih klub že hrani. */
export function declarationFileName(firstName: string, lastName: string) {
  const name = `${firstName} ${lastName}`
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, "_");

  return `Pristopna_izjava_${name}.pdf`;
}
