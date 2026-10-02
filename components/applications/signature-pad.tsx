"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Izvozi samo del platna s potezami (z malo roba). Brez tega bi podpis v
 * izjavi zasedel le drobec okvirja, ker je večina platna prazna.
 */
function exportTrimmed(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return canvas.toDataURL("image/png");

  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] > 0) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < 0) return "";

  const pad = 8;
  left = Math.max(0, left - pad);
  top = Math.max(0, top - pad);
  right = Math.min(width - 1, right + pad);
  bottom = Math.min(height - 1, bottom + pad);

  const trimmed = document.createElement("canvas");
  trimmed.width = right - left + 1;
  trimmed.height = bottom - top + 1;
  trimmed
    .getContext("2d")
    ?.drawImage(canvas, left, top, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);

  return trimmed.toDataURL("image/png");
}

/**
 * Polje za podpis z miško ali prstom.
 *
 * Risba gre v skrito polje kot PNG (data URL), ki ga strežnik shrani in vriše
 * v pristopno izjavo. Platno je narisano v dvojni gostoti zaslona, zato je
 * podpis oster tudi v PDF-ju, a datoteka ostane majhna (nekaj deset kB).
 */
export function SignaturePad({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = Math.max(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) return;

    context.scale(scale, scale);
    context.lineWidth = 2.2;
    context.lineCap = "round";
    context.lineJoin = "round";
    // Temno modro kot pisalo; v PDF-ju se loči od natisnjenega besedila.
    context.strokeStyle = "#0d1a59";
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    last.current = point(event);

    // Pika ob samem dotiku, da se šteje tudi začetnica brez poteze.
    const context = event.currentTarget.getContext("2d");
    if (context && last.current) {
      context.beginPath();
      context.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
      context.fillStyle = "#0d1a59";
      context.fill();
    }
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;

    const context = event.currentTarget.getContext("2d");
    const next = point(event);

    if (context) {
      context.beginPath();
      context.moveTo(last.current.x, last.current.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    }

    last.current = next;
  }

  function end() {
    if (!drawing.current) return;

    drawing.current = false;
    last.current = null;
    setValue(canvasRef.current ? exportTrimmed(canvasRef.current) : "");
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (canvas && context) {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }

    setValue("");
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          aria-label="Polje za podpis"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          // touch-none: brez tega bi poteza s prstom drsela po strani.
          className="block h-44 w-full cursor-crosshair touch-none rounded-[14px] border-2 border-border bg-white"
        />
        {!value ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-lg text-neutral-300">
            Podpiši se tukaj
          </span>
        ) : null}
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="size-4" />
          Pobriši podpis
        </Button>
      </div>
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
