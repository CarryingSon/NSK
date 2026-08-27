"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { getMemberFullName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MemberOption } from "@/types/app";

/**
 * Iskalnik članov. Za razliko od SearchableSelect, ki hrani vpisano besedilo,
 * ta v obrazec odda id člana - naziv je samo za oči.
 */
export function MemberPicker({
  members,
  name = "member_id",
  id = "member-picker",
}: {
  members: MemberOption[];
  name?: string;
  id?: string;
}) {
  const [selected, setSelected] = useState<MemberOption | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => getMemberFullName(m).toLowerCase().includes(q));
  }, [members, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(member: MemberOption) {
    setSelected(member);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) =>
        Math.max(
          0,
          Math.min(filtered.length - 1, event.key === "ArrowDown" ? i + 1 : i - 1),
        ),
      );
      return;
    }
    if (event.key === "Enter" && open && filtered[active]) {
      event.preventDefault();
      choose(filtered[active]);
      return;
    }
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          autoComplete="off"
          value={open ? query : selected ? getMemberFullName(selected) : ""}
          placeholder="Poišči člana ..."
          required={!selected}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-11 w-full rounded-xl border border-border bg-input pl-10 pr-9 text-[0.9375rem] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/30"
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
          className="surface-card absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-[14px] p-1.5 shadow-lg"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-[0.875rem] text-muted-foreground">
              Ni zadetkov.
            </p>
          ) : (
            filtered.map((member, index) => (
              <button
                key={member.id}
                type="button"
                role="option"
                aria-selected={member.id === selected?.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(member)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left text-[0.9375rem] transition-colors",
                  index === active && "bg-accent",
                )}
              >
                <span>{getMemberFullName(member)}</span>
                {member.id === selected?.id ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
