"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ToolbarCommand =
  | "bold"
  | "italic"
  | "underline"
  | "h2"
  | "h3"
  | "ul"
  | "ol";

const toolbarItems: Array<{
  command: ToolbarCommand;
  label: string;
  icon: typeof Bold;
}> = [
  { command: "bold", label: "Krepko", icon: Bold },
  { command: "italic", label: "Ležeče", icon: Italic },
  { command: "underline", label: "Podčrtano", icon: Underline },
  { command: "h2", label: "Naslov 2", icon: Heading2 },
  { command: "h3", label: "Naslov 3", icon: Heading3 },
  { command: "ul", label: "Alineje", icon: List },
  { command: "ol", label: "Oštevilčen seznam", icon: ListOrdered },
];

// Ločnice v orodni vrstici - za istim razmikom kot v predlogi.
const separatorsAfter = new Set<ToolbarCommand>(["underline", "h3", "ol"]);

/**
 * Bogati urejevalnik nad contenteditable.
 *
 * `document.execCommand` je zastarel, a je edini način, ki v vseh brskalnikih
 * dela z izbiro brez lastnega modela dokumenta. Za obseg, ki ga potrebuje
 * obvestilo (krepko, naslovi, seznami, povezave, slike), je to manjše zlo kot
 * cel urejevalnik kot odvisnost. Vsebina se pred pošiljanjem tako ali tako
 * očisti na strežniku.
 */
export function RichTextEditor({
  name,
  defaultValue = "",
  onChange,
}: {
  name: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [value, setValue] = useState(defaultValue);
  const [activeCommands, setActiveCommands] = useState<Set<string>>(new Set());
  const [prompt, setPrompt] = useState<"link" | "image" | null>(null);
  const [promptValue, setPromptValue] = useState("");

  const sync = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    setValue(html);
    onChange?.(html);
  }, [onChange]);

  useEffect(() => {
    const editor = editorRef.current;

    if (editor && defaultValue) {
      editor.innerHTML = defaultValue;
    }

    // Brez tega Enter ustvari <div>, kar v e-pošti izgubi razmik med odstavki.
    try {
      document.execCommand("defaultParagraphSeparator", false, "p");
    } catch {
      // Nekateri brskalniki ukaza ne poznajo; privzeta oznaka je takrat <div>,
      // ki ga čistilec na strežniku razpakira.
    }
    // Vsebino nastavimo samo ob prvem izrisu - kasneje jo ima v rokah uporabnik.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function readState() {
      if (!editorRef.current?.contains(document.getSelection()?.anchorNode ?? null)) {
        return;
      }

      const next = new Set<string>();

      for (const command of ["bold", "italic", "underline"]) {
        try {
          if (document.queryCommandState(command)) {
            next.add(command);
          }
        } catch {
          // queryCommandState zna vreči napako, kadar ni izbire.
        }
      }

      for (const [command, tag] of [
        ["ul", "insertUnorderedList"],
        ["ol", "insertOrderedList"],
      ] as const) {
        try {
          if (document.queryCommandState(tag)) {
            next.add(command);
          }
        } catch {
          // Enako kot zgoraj.
        }
      }

      const block = document.queryCommandValue("formatBlock")?.toLowerCase();

      if (block === "h2") next.add("h2");
      if (block === "h3") next.add("h3");

      setActiveCommands(next);
    }

    document.addEventListener("selectionchange", readState);
    return () => document.removeEventListener("selectionchange", readState);
  }, []);

  function run(command: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    sync();
  }

  function applyCommand(command: ToolbarCommand) {
    switch (command) {
      case "bold":
      case "italic":
      case "underline":
        run(command);
        return;
      case "h2":
      case "h3":
        // Ponoven klik na že aktiven naslov ga vrne v navaden odstavek.
        run(
          "formatBlock",
          activeCommands.has(command) ? "<p>" : `<${command}>`,
        );
        return;
      case "ul":
        run("insertUnorderedList");
        return;
      case "ol":
        run("insertOrderedList");
        return;
    }
  }

  // Fokus v vnosno polje pobriše izbiro v urejevalniku, zato jo shranimo prej
  // in obnovimo tik pred vstavljanjem.
  function openPrompt(kind: "link" | "image") {
    const selection = document.getSelection();

    savedRange.current =
      selection && selection.rangeCount > 0
        ? selection.getRangeAt(0).cloneRange()
        : null;

    setPromptValue("");
    setPrompt(kind);
  }

  function restoreSelection() {
    const selection = document.getSelection();

    if (!selection || !savedRange.current) {
      editorRef.current?.focus();
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRange.current);
  }

  function confirmPrompt() {
    const url = promptValue.trim();

    if (!url) {
      setPrompt(null);
      return;
    }

    restoreSelection();

    if (prompt === "link") {
      run("createLink", url);
    } else {
      run("insertImage", url);
    }

    setPrompt(null);
    setPromptValue("");
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-input">
      <div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-2">
        {toolbarItems.map((item) => (
          <div key={item.command} className="flex items-center">
            <button
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={activeCommands.has(item.command)}
              // onMouseDown namesto onClick: gumb sicer ukrade fokus in izbira
              // v urejevalniku izgine, preden ukaz steče.
              onMouseDown={(event) => {
                event.preventDefault();
                applyCommand(item.command);
              }}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                activeCommands.has(item.command) &&
                  "bg-primary/12 text-primary hover:bg-primary/16 hover:text-primary",
              )}
            >
              <item.icon className="size-4" />
            </button>
            {separatorsAfter.has(item.command) ? (
              <span className="mx-1.5 h-5 w-px bg-border" aria-hidden />
            ) : null}
          </div>
        ))}

        <button
          type="button"
          title="Vstavi povezavo"
          aria-label="Vstavi povezavo"
          onMouseDown={(event) => {
            event.preventDefault();
            openPrompt("link");
          }}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Link2 className="size-4" />
        </button>

        <button
          type="button"
          title="Vstavi sliko s povezave"
          aria-label="Vstavi sliko s povezave"
          onMouseDown={(event) => {
            event.preventDefault();
            openPrompt("image");
          }}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ImagePlus className="size-4" />
        </button>
      </div>

      {prompt ? (
        <div className="flex flex-col gap-2 border-b border-border bg-muted/50 px-3 py-3 sm:flex-row sm:items-center">
          <Input
            autoFocus
            value={promptValue}
            onChange={(event) => setPromptValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                confirmPrompt();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setPrompt(null);
              }
            }}
            placeholder={
              prompt === "link"
                ? "https://www.nsk-klub.si/aktualno"
                : "Povezava do slike, npr. https://.../plakat.jpg"
            }
            className="h-10 flex-1 bg-card"
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={confirmPrompt}>
              {prompt === "link" ? "Dodaj povezavo" : "Vstavi sliko"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPrompt(null)}
            >
              Prekliči
            </Button>
          </div>
        </div>
      ) : null}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Vsebina obvestila"
        data-placeholder="Napiši obvestilo. Uporabi orodno vrstico za naslove, sezname, povezave in slike."
        onInput={sync}
        onBlur={sync}
        className="rich-text-editor min-h-96 w-full px-5 py-4 text-[0.9375rem] leading-relaxed text-foreground outline-none focus-visible:outline-none"
      />

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
