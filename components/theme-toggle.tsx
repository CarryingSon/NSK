"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type Theme = "system" | "light" | "dark";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Sistem", icon: Monitor },
  { value: "light", label: "Svetlo", icon: Sun },
  { value: "dark", label: "Temno", icon: Moon },
];

/**
 * Tri stanja, ne dve: "sistem" je privzeto, da aplikacija sledi napravi.
 * Razreda .light in .dark v globals.css sistemsko nastavitev povozita.
 */
function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");

  if (theme !== "system") {
    root.classList.add(theme);
  }

  try {
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  } catch {
    // Zaseben zavihek ali blokirana hramba - izbira velja samo za to sejo.
  }
}

// localStorage je zunanji vir stanja, zato ga beremo prek useSyncExternalStore
// in ne prek useState + useEffect: slednje sproži dodatno izrisavo po hidraciji.
let listeners: Array<() => void> = [];

function subscribe(onChange: () => void) {
  listeners.push(onChange);
  return () => {
    listeners = listeners.filter((l) => l !== onChange);
  };
}

function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// Na strežniku shranjene izbire ni; skript v <head> jo nanese pred izrisom.
function getServerSnapshot(): Theme {
  return "system";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function choose(next: Theme) {
    apply(next);
    listeners.forEach((l) => l());
  }

  return (
    <div
      role="group"
      aria-label="Barvna shema"
      className="surface-card inline-flex items-center gap-0.5 rounded-full p-1"
    >
      {options.map((option) => {
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => choose(option.value)}
            aria-pressed={isActive}
            title={option.label}
            className={cn(
              "flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
              isActive && "bg-accent text-foreground",
            )}
          >
            <option.icon className="size-4" />
            <span className="sr-only">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
