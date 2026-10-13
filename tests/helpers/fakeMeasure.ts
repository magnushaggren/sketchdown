import type { MeasureText, Size } from "../../src/core";

export const CHAR_W = 9;
export const LINE_H = 21;

/** Fixed-width text: 9 px per character of the longest line, 21 px per line. */
export function fakeTextSize(text: string): Size {
  const lines = text.split("\n");
  return { w: CHAR_W * Math.max(...lines.map((l) => l.length)), h: LINE_H * lines.length };
}

export const fakeMeasure: MeasureText = (text) => fakeTextSize(text);
