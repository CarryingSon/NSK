"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SearchableGroup {
  label: string;
  options: { value: string; label: string }[];
}

/**
 * Iskalni izbirnik nad skupinami možnosti. Domači <select> filtriranja ne pozna,
 * seznam šol pa je predolg za listanje.
 *
 * Polje je navaden <input name>, zato se obrazec obnese tudi brez JavaScripta in
 * dovoli prosto vnesen naziv - seznam srednjih šol ni in ne more biti popoln.
 */
export function SearchableSelect({
  id,
  name,
  groups,
  defaultValue = "",
  placeholder,
  required,
  className,
}: {
  id?: string;
  name: string;
  groups: SearchableGroup[];
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((g) => ({
        label: g.label,
        options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0);
  }, [groups, query]);

  const flat = useMemo(() => filtered.flatMap((g) => g.options), [filtered]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(next: string) {
    setValue(next);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) => {
        const next = event.key === "ArrowDown" ? i + 1 : i - 1;
        return Math.max(0, Math.min(flat.length - 1, next));
      });
      return;
    }

    if (event.key === "Enter" && open && flat[active]) {
      event.preventDefault();
      choose(flat[active].value);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const shown = open ? query : value;

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          value={shown}
          placeholder={placeholder}
          required={required && !value}
          onChange={(event) => {
            setQuery(event.target.value);
            setValue(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-11 w-full rounded-xl border border-border bg-input pl-10 pr-9 text-[0.9375rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30",
            className,
          )}
        />
        <ChevronDown
          className={cn(
            "pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </div>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="surface-card absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-[14px] p-1.5 shadow-lg"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[0.875rem] text-muted-foreground">
              Ni zadetkov. Naziv lahko vpišeš tudi ročno.
            </p>
          ) : (
            filtered.map((group) => (
              <div key={group.label} className="pb-1">
                <p className="px-3 pb-1 pt-2 text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                {group.options.map((option) => {
                  const index = flat.findIndex((o) => o.value === option.value);
                  const isActive = index === active;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={option.value === value}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => choose(option.value)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left text-[0.9375rem] transition-colors",
                        isActive && "bg-accent",
                      )}
                    >
                      <span>{option.label}</span>
                      {option.value === value ? (
                        <Check className="size-4 shrink-0 text-primary" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
