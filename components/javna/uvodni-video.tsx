"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

const POIZVEDBA = "(prefers-reduced-motion: reduce)";

function naroci(obvesti: () => void) {
  const poizvedba = window.matchMedia(POIZVEDBA);
  poizvedba.addEventListener("change", obvesti);
  return () => poizvedba.removeEventListener("change", obvesti);
}

function preberi() {
  return window.matchMedia(POIZVEDBA).matches;
}

// Na strežniku nastavitve ne poznamo. Privzamemo, da gibanje je dovoljeno,
// ker to velja za veliko večino obiskovalcev; kdor ga je izklopil, dobi ob
// hidraciji plakat namesto videa.
function naStrezniku() {
  return false;
}

/**
 * Video v ozadju uvoda.
 *
 * Predvaja se samodejno, brez zvoka in v zanki. Trije atributi so obvezni,
 * da to sploh steče: muted (brez tega brskalniki samodejnega predvajanja ne
 * dovolijo), playsInline (sicer iOS video odpre čez cel zaslon) in loop.
 *
 * Kdor ima v sistemu izklopljeno gibanje animacij, dobi mirujoč plakat.
 * Nenehno gibanje v ozadju ni okras - ljudem z vestibularnimi težavami
 * povzroča slabost, zato je ta nastavitev zahteva in ne vljudnost.
 */
export function UvodniVideo() {
  const brezGibanja = useSyncExternalStore(naroci, preberi, naStrezniku);

  if (brezGibanja) {
    return (
      <Image
        src="/stran/video/uvod-plakat.jpg"
        alt=""
        fill
        sizes="100vw"
        priority
        className="-z-20 object-cover object-center"
      />
    );
  }

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/stran/video/uvod-plakat.jpg"
      aria-hidden="true"
      className="absolute inset-0 -z-20 size-full object-cover object-center"
    >
      <source src="/stran/video/uvod.mp4" type="video/mp4" />
    </video>
  );
}
