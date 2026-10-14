import { drawIcon, isIcon } from "../icons";
import type { DrawContext, Size, TextOptions } from "../types";

// A label is one line of text that may contain icons written as {name}.
// Unknown names stay as literal text. A label without icons is one text
// element, exactly as before icons existed.

type Part = { kind: "text"; text: string; m: Size } | { kind: "icon"; name: string };

export interface Label {
  parts: Part[];
  w: number;
  h: number;
  /** Side of an icon's square. */
  iconSize: number;
  /** True when the label is only icons, e.g. an icon button. */
  iconOnly: boolean;
}

const TOKEN = /\{([a-zA-Z-]+)\}/g;

export function hasIcons(str: string): boolean {
  return [...str.matchAll(TOKEN)].some((m) => isIcon(m[1]));
}

/** Icons are a bit smaller than the line height of text. */
export function iconSizeFor(ctx: DrawContext, fontSize?: number): number {
  return Math.round(ctx.measure(" ", fontSize).h * 0.8);
}

export function measureLabel(ctx: DrawContext, str: string, fontSize?: number): Label {
  if (!hasIcons(str)) {
    const m = ctx.measure(str, fontSize);
    return {
      parts: [{ kind: "text", text: str, m }],
      w: m.w,
      h: m.h,
      iconSize: 0,
      iconOnly: false,
    };
  }
  const s = iconSizeFor(ctx, fontSize);
  const parts: Part[] = [];
  let last = 0;
  const pushText = (t: string) => {
    const text = t.trim();
    if (text) parts.push({ kind: "text", text, m: ctx.measure(text, fontSize) });
  };
  for (const m of str.matchAll(TOKEN)) {
    if (!isIcon(m[1])) continue;
    pushText(str.slice(last, m.index));
    parts.push({ kind: "icon", name: m[1] });
    last = m.index! + m[0].length;
  }
  pushText(str.slice(last));
  const gap = Math.round(s * 0.4);
  const lineH = ctx.measure(" ", fontSize).h;
  const w =
    parts.reduce((sum, p) => sum + (p.kind === "icon" ? s : p.m.w), 0) + gap * (parts.length - 1);
  const h = Math.max(lineH, ...parts.map((p) => (p.kind === "icon" ? s : p.m.h)));
  return { parts, w, h, iconSize: s, iconOnly: parts.every((p) => p.kind === "icon") };
}

/** Draws a measured label with its top-left at (x, y). */
export function drawLabel(
  ctx: DrawContext,
  x: number,
  y: number,
  label: Label,
  o: TextOptions = {},
): void {
  const gap = Math.round(label.iconSize * 0.4);
  let cx = x;
  for (const part of label.parts) {
    if (part.kind === "text") {
      ctx.text(cx, y + (label.h - part.m.h) / 2, part.text, part.m, o);
      cx += part.m.w + gap;
    } else {
      const ink = ctx.ink;
      if (o.color) ctx.ink = o.color;
      drawIcon(ctx, part.name, cx, y + (label.h - label.iconSize) / 2, label.iconSize);
      ctx.ink = ink;
      cx += label.iconSize + gap;
    }
  }
}
