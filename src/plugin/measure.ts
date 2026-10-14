import { fontFamilyCss } from "../adapters/svg";
import type { MeasureText, TextStyle } from "../core";

// Text measuring for notes, where there may be no drawing to ask. The pure
// part takes a width function, so it runs in tests; domTextWidth supplies
// one backed by a canvas.

// Excalidraw's line heights, by font family number.
const LINE_HEIGHTS: Record<number, number> = {
  1: 1.25, // Virgil
  2: 1.15, // Helvetica
  3: 1.2, // Cascadia
  5: 1.25, // Excalifont
  6: 1.35, // Nunito
  7: 1.15, // Lilita One
  8: 1.25, // Comic Shanns
  9: 1.15, // Liberation Sans
};

export function lineHeightOf(fontFamily: number): number {
  return LINE_HEIGHTS[fontFamily] ?? LINE_HEIGHTS[5];
}

/** The CSS font shorthand, with the same fallbacks the SVG uses. */
export function cssFont(style: TextStyle): string {
  return `${style.fontSize}px ${fontFamilyCss(style.fontFamily)}`;
}

/** Measures like Excalidraw: the widest line, and one line height per line. */
export function textMeasurer(width: (font: string, text: string) => number): MeasureText {
  return (text, style) => {
    const font = cssFont(style);
    const lines = text.split("\n");
    return {
      w: Math.max(...lines.map((l) => width(font, l))),
      h: lines.length * style.fontSize * lineHeightOf(style.fontFamily),
    };
  };
}

let context: CanvasRenderingContext2D | null = null;

/** Width of a line of text in a font, from a canvas the page never shows. */
export function domTextWidth(font: string, text: string): number {
  context ??= document.createElement("canvas").getContext("2d");
  if (!context) return text.length * parseFloat(font) * 0.6; // no canvas: a rough guess
  context.font = font;
  return context.measureText(text).width;
}

/**
 * Resolves once the font is loaded, or known to be missing, so measuring
 * doesn't happen against a fallback font that is about to be replaced.
 */
export async function fontReady(style: TextStyle): Promise<void> {
  const font = cssFont(style);
  try {
    if (!document.fonts.check(font)) await document.fonts.load(font);
  } catch {
    // an unknown font: measuring uses the fallback, which is what will show
  }
}
