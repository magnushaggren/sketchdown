import { drawIcon, isIcon } from "../icons";
import type { DrawContext, Size, TextOptions } from "../types";

// A label is one line of text that may contain icons written as {name},
// links written as [text] and grey text written as -text-. Unknown icon
// names stay as literal text. A label without any of these is one text
// element, exactly as before they existed.

type Tone = "link" | "disabled";
type Part =
  | { kind: "text"; text: string; m: Size; tone?: Tone; space: boolean }
  | { kind: "icon"; name: string; space: boolean };

export interface Label {
  parts: Part[];
  w: number;
  h: number;
  /** Side of an icon's square. */
  iconSize: number;
  /** True when the label is only icons, e.g. an icon button. */
  iconOnly: boolean;
}

// {icon} | [link] | -grey-, the last only with a space or the line's end
// around it, so "070-123 45-67" and "2021-03-01" stay as they are.
const TOKEN =
  /\{([a-zA-Z-]+)\}|\[([^[\]]+)\]|(?<=^|\s)-([^\s-](?:[^-]*[^\s-])?)-(?=$|[\s.,;:!?)])/g;
/** Marks that mean a checkbox or a toggle, never a link. */
const NOT_LINKS = new Set(["x", "on", "off"]);

interface Token {
  index: number;
  length: number;
  part: { kind: "icon"; name: string } | { kind: "text"; text: string; tone: Tone };
}

function tokens(str: string): Token[] {
  const out: Token[] = [];
  for (const m of str.matchAll(TOKEN)) {
    const at = { index: m.index!, length: m[0].length };
    if (m[1] !== undefined) {
      if (isIcon(m[1])) out.push({ ...at, part: { kind: "icon", name: m[1] } });
    } else if (m[2] !== undefined) {
      const text = m[2].trim();
      if (text && !NOT_LINKS.has(text.toLowerCase())) {
        out.push({ ...at, part: { kind: "text", text, tone: "link" } });
      }
    } else {
      out.push({ ...at, part: { kind: "text", text: m[3], tone: "disabled" } });
    }
  }
  return out;
}

/** Whether a label needs more than one plain text element. */
export function isRich(str: string): boolean {
  return tokens(str).length > 0;
}

/** Icons are a bit smaller than the line height of text. */
export function iconSizeFor(ctx: DrawContext, fontSize?: number): number {
  return Math.round(ctx.measure(" ", fontSize).h * 0.8);
}

export function measureLabel(ctx: DrawContext, str: string, fontSize?: number): Label {
  const found = tokens(str);
  if (!found.length) {
    const m = ctx.measure(str, fontSize);
    return {
      parts: [{ kind: "text", text: str, m, space: false }],
      w: m.w,
      h: m.h,
      iconSize: 0,
      iconOnly: false,
    };
  }
  const s = iconSizeFor(ctx, fontSize);
  const parts: Part[] = [];
  let space = false; // whitespace before the next part
  const pushText = (raw: string) => {
    if (/^\s/.test(raw)) space = true;
    const text = raw.trim();
    if (text) {
      parts.push({ kind: "text", text, m: ctx.measure(text, fontSize), space });
      space = /\s$/.test(raw);
    }
  };
  let last = 0;
  for (const t of found) {
    pushText(str.slice(last, t.index));
    if (t.part.kind === "icon") parts.push({ ...t.part, space });
    else parts.push({ ...t.part, m: ctx.measure(t.part.text, fontSize), space });
    space = false;
    last = t.index + t.length;
  }
  pushText(str.slice(last));
  const lineH = ctx.measure(" ", fontSize).h;
  const w = parts.reduce(
    (sum, p, i) => sum + gapBefore(parts, i, s, ctx, fontSize) + (p.kind === "icon" ? s : p.m.w),
    0,
  );
  const h = Math.max(lineH, ...parts.map((p) => (p.kind === "icon" ? s : p.m.h)));
  return { parts, w, h, iconSize: s, iconOnly: parts.every((p) => p.kind === "icon") };
}

/** Space before part i: a fixed gap next to an icon, else the text's own space. */
function gapBefore(
  parts: Part[],
  i: number,
  iconSize: number,
  ctx: DrawContext,
  fontSize?: number,
): number {
  if (i === 0) return 0;
  if (parts[i].kind === "icon" || parts[i - 1].kind === "icon") return Math.round(iconSize * 0.4);
  return parts[i].space ? ctx.measure(" ", fontSize).w : 0;
}

/** Draws a measured label with its top-left at (x, y). */
export function drawLabel(
  ctx: DrawContext,
  x: number,
  y: number,
  label: Label,
  o: TextOptions = {},
): void {
  const { colors } = ctx.theme;
  const disabled = ctx.ink === colors.disabled;
  let cx = x;
  label.parts.forEach((part, i) => {
    cx += gapBefore(label.parts, i, label.iconSize, ctx, o.fontSize);
    if (part.kind === "text") {
      const ty = y + (label.h - part.m.h) / 2;
      // in a disabled component everything is grey, links too
      const color =
        part.tone === "link" && !disabled
          ? colors.link
          : part.tone === "disabled"
            ? colors.disabled
            : o.color;
      ctx.text(cx, ty, part.text, part.m, { ...o, ...(color ? { color } : {}) });
      if (part.tone === "link") {
        ctx.line(
          [
            [cx, ty + part.m.h - 2],
            [cx + part.m.w, ty + part.m.h - 2],
          ],
          1,
          color,
        );
      }
      cx += part.m.w;
    } else {
      const ink = ctx.ink;
      if (o.color) ctx.ink = o.color;
      drawIcon(ctx, part.name, cx, y + (label.h - label.iconSize) / 2, label.iconSize);
      ctx.ink = ink;
      cx += label.iconSize;
    }
  });
}
