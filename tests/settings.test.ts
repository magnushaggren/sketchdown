import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE } from "../src/core";
import type { Style } from "../src/core";
import { createOrEdit } from "../src/plugin/edit";
import type { EditHost } from "../src/plugin/edit";
import { DEFAULT_SETTINGS, normalizeSettings, styleOf, themeOf } from "../src/plugin/settings";
import type { Settings } from "../src/plugin/settings";
import { FakeEa } from "./helpers/fakeEa";

const canvas: Style = { stroke: "#e03131", fontFamily: 1, roughness: 0, fontSize: FONT_SIZE };
const host = (answer: string): EditHost => ({ prompt: async () => answer, notify: () => {} });
const withSettings = (over: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...over });

describe("defaults", () => {
  it("are the prototype's look", () => {
    expect(themeOf(DEFAULT_SETTINGS)).toEqual(DEFAULT_THEME);
    expect(styleOf(DEFAULT_SETTINGS, canvas)).toEqual(canvas);
  });
});

describe("normalizeSettings", () => {
  it.each([null, undefined, "x", 3, []])("gives the defaults for %j", (data) => {
    expect(normalizeSettings(data)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid values and fills in the rest", () => {
    const s = normalizeSettings({ colors: { fill: "#FFAA00" }, gap: { row: 20 }, fontSize: 20 });
    expect(s.colors).toEqual({ ...DEFAULT_SETTINGS.colors, fill: "#ffaa00" });
    expect(s.gap).toEqual({ ...DEFAULT_SETTINGS.gap, row: 20 });
    expect(s.fontSize).toBe(20);
    expect(s.useCanvasStyle).toBe(true);
    expect(s.renderBlocks).toBe(true);
  });

  it("reads the code block switch", () => {
    expect(normalizeSettings({ renderBlocks: false }).renderBlocks).toBe(false);
    expect(normalizeSettings({ renderBlocks: "no" }).renderBlocks).toBe(true);
  });

  it("replaces invalid values with defaults and clamps numbers", () => {
    const s = normalizeSettings({
      colors: { fill: "red", primary: 5 },
      gap: { root: -5, stack: 999, row: "12", pad: NaN },
      fontSize: 500,
      useCanvasStyle: "no",
      fixed: { stroke: "#12345", fontFamily: 1.5, roughness: 7 },
    });
    expect(s.colors).toEqual(DEFAULT_SETTINGS.colors);
    expect(s.gap).toEqual({ root: 0, stack: 200, row: 12, pad: 16 });
    expect(s.fontSize).toBe(72);
    expect(s.useCanvasStyle).toBe(true);
    expect(s.fixed).toEqual({ stroke: "#1e1e1e", fontFamily: 5, roughness: 2 });
  });

  it("does not share objects with the defaults", () => {
    const s = normalizeSettings({});
    s.colors.fill = "#000000";
    s.gap.root = 1;
    s.fixed.roughness = 0;
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.colors.fill).toBe(DEFAULT_THEME.colors.fill);
  });
});

describe("styleOf", () => {
  it("uses the fixed style when the canvas style is off", () => {
    const fixed = { stroke: "#2f9e44", fontFamily: 6, roughness: 2 };
    expect(styleOf(withSettings({ useCanvasStyle: false, fixed }), canvas)).toEqual({
      ...fixed,
      fontSize: FONT_SIZE,
    });
  });

  it("always takes the font size from the settings", () => {
    expect(styleOf(withSettings({ fontSize: 20 }), canvas).fontSize).toBe(20);
  });
});

describe("drawing with settings", () => {
  it("uses the colours, font size and fixed style", async () => {
    const ea = new FakeEa();
    const settings = withSettings({
      colors: { ...DEFAULT_SETTINGS.colors, primary: "#ffc9c9" },
      fontSize: 20,
      useCanvasStyle: false,
      fixed: { stroke: "#2f9e44", fontFamily: 6, roughness: 2 },
    });
    await createOrEdit(ea, host("button: *Save"), "edit", settings);
    expect(ea.calls[0].style).toMatchObject({
      backgroundColor: "#ffc9c9",
      strokeColor: "#2f9e44",
      roughness: 2,
    });
    expect(ea.calls[1].style).toMatchObject({ fontSize: 20, fontFamily: 6 });
  });

  it("uses the gaps", async () => {
    const top = async (root: number) => {
      const ea = new FakeEa();
      const settings = withSettings({ gap: { ...DEFAULT_SETTINGS.gap, root } });
      await createOrEdit(ea, host("button: A\nbutton: B"), "edit", settings);
      const ys = ea.calls.filter((c) => c.kind === "rect").map((c) => c.args[1] as number);
      return ys[1] - ys[0];
    };
    expect((await top(50)) - (await top(24))).toBe(26);
  });
});
