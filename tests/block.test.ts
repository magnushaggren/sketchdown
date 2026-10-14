import { describe, expect, it } from "vitest";
import { SNIPPETS } from "../src/core";
import { blockStyle, renderBlock } from "../src/plugin/block";
import { DEFAULT_SETTINGS } from "../src/plugin/settings";
import type { Settings } from "../src/plugin/settings";
import { GALLERY } from "./fixtures/gallery";
import { fakeMeasure } from "./helpers/fakeMeasure";

const settings: Settings = {
  ...DEFAULT_SETTINGS,
  useCanvasStyle: true,
  fixed: { stroke: "#c92a2a", fontFamily: 3, roughness: 2 },
};

describe("renderBlock", () => {
  it("draws a spec as one SVG, with no errors", () => {
    const r = renderBlock("button: *Save", settings, fakeMeasure);
    expect(r.errors).toEqual([]);
    expect(r.svg).toMatch(/^<svg [^>]*>.*<\/svg>$/s);
    expect(r.svg).toContain(">Save</text>");
  });

  it("always uses the fixed style, since a note has no canvas", () => {
    expect(blockStyle(settings)).toEqual({
      stroke: "#c92a2a",
      fontFamily: 3,
      roughness: 2,
      fontSize: DEFAULT_SETTINGS.fontSize,
    });
    const r = renderBlock("button: Save", settings, fakeMeasure);
    expect(r.svg).toContain('fill="#c92a2a"');
    expect(r.svg).toContain("Cascadia");
  });

  it("uses the settings' colours", () => {
    const pink = { ...settings, colors: { ...settings.colors, primary: "#ff00ff" } };
    expect(renderBlock("button: *Save", pink, fakeMeasure).svg).toContain("#ff00ff");
  });

  it("reports errors with line numbers and still draws the rest", () => {
    const r = renderBlock("button: A\n\nnonsense", settings, fakeMeasure);
    expect(r.errors).toEqual([{ line: 3, message: `don't understand "nonsense"` }]);
    expect(r.svg).toContain(">A</text>");
  });

  it("gives no SVG for an empty block", () => {
    expect(renderBlock("  \n", settings, fakeMeasure)).toEqual({ svg: "", errors: [] });
  });

  it("gives the same SVG every time, so a note doesn't flicker as it re-renders", () => {
    const a = renderBlock(GALLERY, settings, fakeMeasure).svg;
    expect(renderBlock(GALLERY, settings, fakeMeasure).svg).toBe(a);
  });

  it.each([["gallery", GALLERY], ...SNIPPETS.map((s) => [s.name, s.text])])(
    "renders %s without errors",
    (_name, source) => {
      const r = renderBlock(source, settings, fakeMeasure);
      expect(r.errors).toEqual([]);
      expect(r.svg.length).toBeGreaterThan(0);
    },
  );
});
