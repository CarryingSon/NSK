// Vsebina obvestila prihaja iz bogatega urejevalnika, torej kot HTML. Preden
// pristane v e-pošti in v predogledu zgodovine, jo prepišemo na ozek nabor
// oznak: lepljenje iz Worda ali brskalnika sicer prinese <script>, sloge in
// razrede, ki jih Gmail vseeno vrže stran, predogled v aplikaciji pa bi jih
// izrisal.

const allowedTags = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
]);

// Oznake, ki jih odstranimo, vsebino pa obdržimo.
const unwrappedTags = new Set([
  "div",
  "span",
  "font",
  "section",
  "article",
  "main",
  "body",
  "html",
  "h1",
  "h4",
  "h5",
  "h6",
  "small",
  "sub",
  "sup",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "pre",
  "code",
  "figure",
  "figcaption",
]);

// Oznake, kjer odstranimo tudi vsebino.
const strippedElements = [
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "noscript",
  "head",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "svg",
  "math",
];

const voidTags = new Set(["br", "img"]);

const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const attributePattern = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function escapeHtml(value: string) {
  return escapeAttribute(value).replaceAll("'", "&#39;");
}

function readAttributes(raw: string) {
  const attributes = new Map<string, string>();
  let match: RegExpExecArray | null;

  attributePattern.lastIndex = 0;

  while ((match = attributePattern.exec(raw)) !== null) {
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes.set(match[1].toLowerCase(), value);
  }

  return attributes;
}

// Dovolimo samo sheme, ki jih poštni odjemalci dejansko odprejo. "javascript:"
// in "data:" v povezavi sta klasična vektorja, zato odpadeta.
function safeLinkHref(value?: string) {
  if (!value) return null;

  const trimmed = value.trim();

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function safeImageSrc(value?: string) {
  if (!value) return null;

  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function renderOpenTag(tag: string, attributes: Map<string, string>) {
  if (tag === "a") {
    const href = safeLinkHref(attributes.get("href"));

    if (!href) {
      return null;
    }

    return `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer" style="color:#f36717;text-decoration:underline;">`;
  }

  if (tag === "img") {
    const src = safeImageSrc(attributes.get("src"));

    if (!src) {
      return null;
    }

    const alt = escapeAttribute(attributes.get("alt") ?? "");

    return `<img src="${escapeAttribute(src)}" alt="${alt}" style="max-width:100%;height:auto;border-radius:12px;display:block;margin:18px 0;" />`;
  }

  if (tag === "br") {
    return "<br />";
  }

  return `<${tag}>`;
}

/**
 * Prepiše HTML iz urejevalnika na varen, poštnim odjemalcem prijazen nabor oznak.
 * Rezultat je vedno uravnotežen - nezaprte oznake zapremo na koncu, ker bi sicer
 * odprt <ul> potegnil vase nogo e-pošte.
 */
export function sanitizeRichText(input: string) {
  if (!input) return "";

  let html = input.replace(/<!--[\s\S]*?-->/g, "");

  for (const tag of strippedElements) {
    html = html.replace(
      new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}\\s*>`, "gi"),
      "",
    );
    html = html.replace(new RegExp(`<\\/?${tag}\\b[^>]*>`, "gi"), "");
  }

  const openTags: string[] = [];
  let output = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  tagPattern.lastIndex = 0;

  while ((match = tagPattern.exec(html)) !== null) {
    output += html.slice(lastIndex, match.index);
    lastIndex = match.index + match[0].length;

    const raw = match[0];
    const tag = match[1].toLowerCase();
    const isClosing = raw.startsWith("</");

    if (!allowedTags.has(tag)) {
      // Neznane oznake tiho odstranimo; vsebina med njimi ostane.
      if (!unwrappedTags.has(tag)) {
        continue;
      }

      continue;
    }

    if (isClosing) {
      if (voidTags.has(tag)) {
        continue;
      }

      const position = openTags.lastIndexOf(tag);

      if (position === -1) {
        continue;
      }

      // Zapremo tudi vse, kar je ostalo odprto znotraj te oznake.
      while (openTags.length > position) {
        const openTag = openTags.pop();
        output += `</${openTag}>`;
      }

      continue;
    }

    const rendered = renderOpenTag(tag, readAttributes(match[2] ?? ""));

    if (!rendered) {
      continue;
    }

    output += rendered;

    if (!voidTags.has(tag) && !raw.endsWith("/>")) {
      openTags.push(tag);
    }
  }

  output += html.slice(lastIndex);

  while (openTags.length > 0) {
    output += `</${openTags.pop()}>`;
  }

  return output.trim();
}

const entityMap: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Golo besedilo za odjemalce, ki HTML ne prikažejo, in za predogled v seznamu.
 * Blokovne oznake postanejo prelomi vrstic, alineje dobijo vezaj.
 */
export function richTextToPlainText(html: string) {
  if (!html) return "";

  let text = html
    .replace(/<\/(p|h2|h3|li|ul|ol|blockquote)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "");

  for (const [entity, value] of Object.entries(entityMap)) {
    text = text.replaceAll(entity, value);
  }

  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

// Ali je v vsebini sploh kaj besedila? Prazen <p><br></p> iz urejevalnika ne šteje.
export function hasRichTextContent(html: string) {
  return richTextToPlainText(html).replace(/\s/g, "").length > 0;
}
