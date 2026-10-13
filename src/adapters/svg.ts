import rough from "roughjs";
import type { DrawOp, Style } from "../core/types";

export interface SvgOptions {
  /** Empty space around the drawing, in px. */
  padding?: number;
  /** Fixed by default, so the same ops always give the same wobble. */
  seed?: number;
}

type Generator = ReturnType<typeof rough.generator>;
type Drawable = ReturnType<Generator["path"]>;

// Excalidraw's font family numbers, with fallbacks for when the font isn't loaded.
const FONTS: Record<number, string> = {
  1: "Virgil, Excalifont, cursive",
  2: "Helvetica, Arial, sans-serif",
  3: "Cascadia, 'Cascadia Code', monospace",
  5: "Excalifont, Virgil, cursive",
  6: "Nunito, sans-serif",
  7: "'Lilita One', sans-serif",
  8: "'Comic Shanns', monospace",
  9: "'Liberation Sans', Arial, sans-serif",
};

export function fontFamilyCss(fontFamily: number): string {
  return FONTS[fontFamily] ?? FONTS[5];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const num = (n: number) => String(Math.round(n * 100) / 100);

// Same corner radius as Excalidraw's adaptive roundness (type 3).
function roundedRectPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(Math.min(w, h) * 0.25, 32);
  return (
    `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y}, ${x + w} ${y + r} ` +
    `L ${x + w} ${y + h - r} Q ${x + w} ${y + h}, ${x + w - r} ${y + h} ` +
    `L ${x + r} ${y + h} Q ${x} ${y + h}, ${x} ${y + h - r} ` +
    `L ${x} ${y + r} Q ${x} ${y}, ${x + r} ${y}`
  );
}

function bounds(ops: DrawOp[]): { x: number; y: number; w: number; h: number } {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  const add = (x: number, y: number) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  };
  for (const op of ops) {
    if (op.kind === "line") op.points.forEach((p) => add(p[0], p[1]));
    else {
      add(op.x, op.y);
      add(op.x + op.w, op.y + op.h);
    }
  }
  return ops.length ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: 0, h: 0 };
}

/** Renders the ops as a standalone SVG string in Excalidraw's hand-drawn look. */
export function renderSvg(ops: DrawOp[], style: Style, options: SvgOptions = {}): string {
  const pad = options.padding ?? 8;
  const gen = rough.generator();
  let seed = options.seed ?? 1;
  const out: string[] = [];

  const emit = (drawable: Drawable) => {
    for (const p of gen.toPaths(drawable)) {
      // rough.js writes full float precision; two decimals keep the markup small
      const d = p.d.replace(/-?\d+\.\d{3,}(e-?\d+)?/g, (n) => num(Number(n)));
      out.push(
        `<path d="${d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" ` +
          `fill="${p.fill ?? "none"}" stroke-linecap="round" stroke-linejoin="round"/>`,
      );
    }
  };

  for (const op of ops) {
    const base = {
      seed: seed++,
      roughness: style.roughness,
      strokeWidth: op.kind === "text" ? 1 : op.strokeWidth,
    };
    switch (op.kind) {
      case "rect":
      case "ellipse": {
        const o = {
          ...base,
          stroke: op.stroke ? style.stroke : "none",
          fill: op.fill ?? undefined,
          fillStyle: "solid",
        };
        if (op.kind === "ellipse") {
          emit(gen.ellipse(op.x + op.w / 2, op.y + op.h / 2, op.w, op.h, o));
        } else if (op.rounded) {
          emit(gen.path(roundedRectPath(op.x, op.y, op.w, op.h), o));
        } else {
          emit(gen.rectangle(op.x, op.y, op.w, op.h, o));
        }
        break;
      }
      case "line":
        emit(
          gen.linearPath(
            op.points.map((p) => [p[0], p[1]]),
            { ...base, stroke: style.stroke },
          ),
        );
        break;
      case "text": {
        const lines = op.text.split("\n");
        const lineH = op.h / lines.length;
        lines.forEach((line, i) => {
          out.push(
            `<text x="${num(op.x)}" y="${num(op.y + (i + 0.5) * lineH)}" ` +
              `dominant-baseline="central" xml:space="preserve">${escapeXml(line)}</text>`,
          );
        });
        break;
      }
    }
  }

  const b = bounds(ops);
  const w = b.w + 2 * pad;
  const h = b.h + 2 * pad;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${num(w)}" height="${num(h)}" ` +
    `viewBox="${num(b.x - pad)} ${num(b.y - pad)} ${num(w)} ${num(h)}" ` +
    `font-family="${escapeXml(fontFamilyCss(style.fontFamily))}" font-size="${style.fontSize}" ` +
    `fill="${escapeXml(style.stroke)}">` +
    out.join("") +
    `</svg>`
  );
}
