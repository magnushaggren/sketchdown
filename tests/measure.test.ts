import { describe, expect, it } from "vitest";
import { cssFont, lineHeightOf, textMeasurer } from "../src/plugin/measure";

// a fake canvas: 10 px per character, and it records the fonts it was given
const fonts: string[] = [];
const width = (font: string, text: string) => {
  fonts.push(font);
  return text.length * 10;
};

describe("textMeasurer", () => {
  const measure = textMeasurer(width);

  it("measures one line with Excalidraw's line height for the font", () => {
    expect(measure("Save", { fontSize: 16, fontFamily: 5 })).toEqual({ w: 40, h: 16 * 1.25 });
    expect(measure("Save", { fontSize: 20, fontFamily: 2 })).toEqual({ w: 40, h: 20 * 1.15 });
  });

  it("takes the widest line, and a line height per line", () => {
    expect(measure("a\nlonger\nb", { fontSize: 10, fontFamily: 3 })).toEqual({ w: 60, h: 36 });
  });

  it("uses the same CSS font as the SVG", () => {
    fonts.length = 0;
    measure("x", { fontSize: 16, fontFamily: 5 });
    expect(fonts).toEqual([cssFont({ fontSize: 16, fontFamily: 5 })]);
    expect(fonts[0]).toBe("16px Excalifont, Virgil, cursive");
  });
});

describe("lineHeightOf", () => {
  it("falls back to Excalifont's for unknown fonts", () => {
    expect(lineHeightOf(99)).toBe(1.25);
  });
});
