import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, INK, layout, parse } from "../src/core";
import type { DrawOp, EllipseOp, RectOp, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const ellipses = (ops: DrawOp[]) => ops.filter((o): o is EllipseOp => o.kind === "ellipse");
const { colors } = DEFAULT_THEME;

describe("radio", () => {
  it("parses, also as radios and option", () => {
    for (const kw of ["radio", "radios", "option"]) {
      expect(parse(`${kw}: A`).tree.children[0].type).toBe("radio");
    }
  });

  it("stacks circles with labels, like checkboxes", () => {
    const { ops, size } = draw("radio: Small | Medium\nLarge");
    expect(texts(ops).map((t) => [t.text, t.x, t.y])).toEqual([
      ["Small", 14 + 8, 0],
      ["Medium", 14 + 8, LINE_H + 8],
      ["Large", 14 + 8, 2 * (LINE_H + 8)],
    ]);
    expect(ellipses(ops)).toHaveLength(3);
    expect(ellipses(ops)[0]).toMatchObject({ w: 14, h: 14, fill: colors.paper });
    expect(size).toEqual({ w: 14 + 8 + 6 * CHAR_W, h: 3 * LINE_H + 16 });
  });

  it("fills the dot of the item marked with *", () => {
    const { ops } = draw("radio: Small | *Medium");
    const dots = ellipses(ops).filter((e) => e.fill === INK);
    expect(dots).toHaveLength(1);
    expect(dots[0].y).toBeGreaterThan(LINE_H);
    expect(texts(ops)[1].text).toBe("Medium");
  });

  it("reads (o) and ( ) marks too", () => {
    const { ops } = draw("radio: ( ) Small | (o) Medium");
    expect(texts(ops).map((t) => t.text)).toEqual(["Small", "Medium"]);
    expect(ellipses(ops).filter((e) => e.fill === INK)).toHaveLength(1);
  });

  it("allows icons and links in labels", () => {
    expect(texts(draw("radio: *{user} Me | [Someone else]").ops)[1].color).toBe(colors.link);
  });
});

describe("toggle", () => {
  it("parses, also as switch", () => {
    expect(parse("toggle: A").tree.children[0].type).toBe("toggle");
    expect(parse("switch: A").tree.children[0].type).toBe("toggle");
  });

  it("draws an on toggle blue with the knob on the right", () => {
    const { ops, size } = draw("toggle: [on] Wi-Fi");
    const [track] = rects(ops);
    expect(track).toMatchObject({ x: 0, w: 32, h: 18, rounded: true, fill: colors.primary });
    const [knob] = ellipses(ops);
    expect(knob.x + knob.w).toBe(32 - 3);
    expect(texts(ops)[0]).toMatchObject({ text: "Wi-Fi", x: 32 + 8 });
    expect(size).toEqual({ w: 32 + 8 + 5 * CHAR_W, h: LINE_H });
  });

  it("draws an off toggle grey with the knob on the left", () => {
    const { ops } = draw("toggle: [off] Bluetooth");
    expect(rects(ops)[0].fill).toBe(colors.fill);
    expect(ellipses(ops)[0].x).toBe(3);
  });

  it("is off without a mark and on with *", () => {
    const { ops } = draw("toggle: Wi-Fi | *Bluetooth");
    expect(rects(ops).map((r) => r.fill)).toEqual([colors.fill, colors.primary]);
    expect(texts(ops).map((t) => t.text)).toEqual(["Wi-Fi", "Bluetooth"]);
  });
});

describe("slider", () => {
  it("parses, also as range", () => {
    expect(parse("slider: 40%").tree.children[0].type).toBe("slider");
    expect(parse("range: 40%").tree.children[0].type).toBe("slider");
  });

  it("is 200 wide, with the track filled up to the knob", () => {
    // the track is inset by the knob's radius, so the knob stays inside at 0 and 100%
    const { ops, size } = draw("slider: 50%");
    const [track, filled] = rects(ops);
    expect(track).toMatchObject({ x: 8, w: 184, fill: colors.fill });
    expect(filled).toMatchObject({ x: 8, w: 92, fill: colors.primary });
    const [knob] = ellipses(ops);
    expect(knob.x + knob.w / 2).toBe(100);
    expect(size).toEqual({ w: 200, h: 16 });
  });

  it("takes (w=...) and (fill)", () => {
    expect(draw("slider: 50% (w=300)").size.w).toBe(300);
    expect(draw("box (w=400)\n  slider: 50% (fill)").size.w).toBe(400);
  });

  it("sits at 50% without a value and keeps values within 0..100", () => {
    const at = (s: string) => {
      const [knob] = ellipses(draw(s).ops);
      return knob.x + knob.w / 2;
    };
    expect(at("slider:")).toBe(100);
    expect(at("slider: 150%")).toBe(192);
    expect(at("slider: 0%")).toBe(8);
  });

  it("draws no filled part at 0%", () => {
    expect(rects(draw("slider: 0%").ops)).toHaveLength(1);
  });
});
