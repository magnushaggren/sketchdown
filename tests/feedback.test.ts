import { describe, expect, it } from "vitest";
import { renderOps } from "../src/adapters/excalidraw";
import { renderSvg } from "../src/adapters/svg";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { FakeEa } from "./helpers/fakeEa";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const { colors } = DEFAULT_THEME;

describe("alert", () => {
  it("parses, also as message and notice", () => {
    for (const kw of ["alert", "message", "notice"]) {
      expect(parse(`${kw}: A`).tree.children[0].type).toBe("alert");
    }
  });

  it("draws a tinted box around its text", () => {
    const { ops, size } = draw("alert: Saved!");
    expect(rects(ops)[0]).toMatchObject({ x: 0, y: 0, fill: colors.selected, rounded: true });
    expect(texts(ops)[0]).toMatchObject({ text: "Saved!", x: 12, y: 10 });
    expect(size).toEqual({ w: 6 * CHAR_W + 24, h: LINE_H + 20 });
  });

  it("allows icons, links and more lines", () => {
    const { ops, size } = draw("alert: {info} Saved!\n[Undo]");
    expect(texts(ops).map((t) => t.text)).toEqual(["Saved!", "Undo"]);
    expect(texts(ops)[1].color).toBe(colors.link);
    expect(size.h).toBe(2 * LINE_H + 20);
  });

  it("stretches with (w=...) and (fill)", () => {
    expect(draw("alert: A (w=300)").size.w).toBe(300);
    expect(
      draw("box (w=400)\n  alert: A (fill)").ops.some((o) => o.kind === "rect" && o.w === 368),
    ).toBe(true);
  });

  it("keeps normal ink on a dark panel, since it is light", () => {
    expect(texts(draw("box (dark)\n  alert: A").ops)[0]).not.toHaveProperty("color");
  });
});

describe("progress", () => {
  it("draws a bar 200 wide, filled to the value", () => {
    const { ops, size } = draw("progress: 60%");
    const [track, bar] = rects(ops);
    expect(track).toMatchObject({ x: 0, y: 0, w: 200, h: 14, fill: colors.fill });
    expect(bar).toMatchObject({ x: 0, y: 0, w: 120, h: 14, fill: colors.primary });
    expect(texts(ops)).toEqual([]);
    expect(size).toEqual({ w: 200, h: 14 });
  });

  it("puts the rest of the text above the bar", () => {
    const { ops, size } = draw("progress: Uploading 60%");
    expect(texts(ops)[0]).toMatchObject({ text: "Uploading", x: 0, y: 0 });
    expect(rects(ops)[0].y).toBe(LINE_H + 6);
    expect(size.h).toBe(LINE_H + 6 + 14);
  });

  it("takes (w=...) and (fill), and keeps values within 0..100", () => {
    expect(draw("progress: 10% (w=300)").size.w).toBe(300);
    expect(draw("box (w=400)\n  progress: 10% (fill)").size.w).toBe(400);
    expect(rects(draw("progress: 0%").ops)).toHaveLength(1);
    expect(rects(draw("progress: 250%").ops)[1].w).toBe(200);
  });

  it("is empty without a value", () => {
    expect(rects(draw("progress:").ops)).toHaveLength(1);
  });
});

describe("tooltip", () => {
  it("parses, also as hint", () => {
    expect(parse("tooltip: A").tree.children[0].type).toBe("tooltip");
    expect(parse("hint: A").tree.children[0].type).toBe("tooltip");
  });

  it("draws a small dark box with light text and a pointer below", () => {
    const { ops, size } = draw("tooltip: Copied");
    const [box] = rects(ops);
    const h = LINE_H + 12;
    expect(box).toMatchObject({ x: 0, y: 0, w: 6 * CHAR_W + 20, h, fill: colors.dark });
    expect(texts(ops)[0]).toMatchObject({ text: "Copied", x: 10, y: 6, color: colors.onDark });
    const [pointer] = lines(ops);
    expect(Math.max(...pointer.points.map((p) => p[1]))).toBe(h + 8);
    expect(size).toEqual({ w: box.w, h: h + 8 });
  });

  it("is grey with (disabled)", () => {
    expect(texts(draw("tooltip: A (disabled)").ops)[0].color).toBe(colors.disabled);
  });
});

describe("image", () => {
  it("parses, also as img and picture", () => {
    for (const kw of ["image", "img", "picture"]) {
      expect(parse(`${kw}: 10x10`).tree.children[0].type).toBe("image");
    }
  });

  it("draws a crossed box of the given size", () => {
    const { ops, size } = draw("image: 320x180");
    expect(rects(ops)[0]).toMatchObject({ x: 0, y: 0, w: 320, h: 180 });
    expect(lines(ops).map((l) => l.points)).toEqual([
      [
        [0, 0],
        [320, 180],
      ],
      [
        [320, 0],
        [0, 180],
      ],
    ]);
    expect(size).toEqual({ w: 320, h: 180 });
  });

  it("is 200 by 120 by default, and takes (w=...), (h=...) and (fill)", () => {
    expect(draw("image:").size).toEqual({ w: 200, h: 120 });
    expect(draw("image: (w=100, h=50)").size).toEqual({ w: 100, h: 50 });
    expect(
      draw("box (w=400)\n  image: 100x50 (fill)").ops.some((o) => o.kind === "rect" && o.w === 368),
    ).toBe(true);
  });

  it("centres a caption on a white patch over the cross", () => {
    const { ops } = draw("image: 300x100 Team photo");
    const t = texts(ops)[0];
    expect(t.text).toBe("Team photo");
    expect(t.x + t.w / 2).toBe(150);
    expect(t.color).toBe(colors.muted);
    const patch = rects(ops)[1];
    expect(patch).toMatchObject({ fill: colors.paper, stroke: false });
    expect(ops.indexOf(patch)).toBeGreaterThan(ops.indexOf(lines(ops)[1]));
  });
});

describe("placeholder", () => {
  it("parses", () => {
    expect(parse("placeholder: 10x10").tree.children[0].type).toBe("placeholder");
  });

  it("draws a dashed, rounded, unfilled box of the given size", () => {
    const { ops, size } = draw("placeholder: 240x60");
    expect(rects(ops)).toEqual([
      expect.objectContaining({
        x: 0,
        y: 0,
        w: 240,
        h: 60,
        fill: null,
        rounded: true,
        dashed: true,
      }),
    ]);
    expect(texts(ops)).toEqual([]);
    expect(size).toEqual({ w: 240, h: 60 });
  });

  it("centres the name in grey", () => {
    const { ops } = draw("placeholder: 300x100 {calendar} Date picker");
    const t = texts(ops)[0];
    expect(t.text).toBe("Date picker");
    expect(t.color).toBe(colors.muted);
    expect(t.y + t.h / 2).toBe(50);
  });

  it("fits the name when no size is given, and is at least 120 by 40", () => {
    expect(draw("placeholder:").size).toEqual({ w: 120, h: 40 });
    const name = "Rich text editor";
    expect(draw(`placeholder: ${name}`).size).toEqual({ w: name.length * CHAR_W + 24, h: 40 });
  });

  it("grows to fit its name rather than drawing outside its size", () => {
    expect(draw("placeholder: 40x10 Avatar").size).toEqual({
      w: 6 * CHAR_W + 24,
      h: LINE_H + 16,
    });
  });

  it("takes (w=...), (h=...) and (fill)", () => {
    expect(draw("placeholder: (w=300, h=80)").size).toEqual({ w: 300, h: 80 });
    expect(
      draw("box (w=400)\n  placeholder: 100x50 (fill)").ops.some(
        (o) => o.kind === "rect" && o.w === 368 && o.dashed,
      ),
    ).toBe(true);
  });

  it("is grey with (disabled)", () => {
    const { ops } = draw("placeholder: Map (disabled)");
    expect(rects(ops)[0].color).toBe(colors.disabled);
    expect(texts(ops)[0].color).toBe(colors.disabled);
  });

  it("leaves the dashed key out of other rectangles", () => {
    expect(rects(draw("image: 10x10").ops).every((r) => !("dashed" in r))).toBe(true);
  });

  it("is dashed in Excalidraw and in SVG", () => {
    const { ops } = draw("placeholder: 100x40");
    const ea = new FakeEa();
    renderOps(ea, ops, style);
    expect(ea.calls[0].style.strokeStyle).toBe("dashed");
    expect(renderSvg(ops, style)).toContain("stroke-dasharray");
    expect(renderSvg(draw("image: 10x10").ops, style)).not.toContain("stroke-dasharray");
  });
});
