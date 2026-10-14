import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, RectOp, Style, TextOp } from "../src/core";
import { fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const frames = (ops: DrawOp[]) => rects(ops).filter((r) => r.strokeWidth === 2 && !r.rounded);
const { colors } = DEFAULT_THEME;

describe("columns", () => {
  it("parses as a container, with or without a colon, and as cols", () => {
    expect(parse("columns\n  box\n  box").tree.children[0].children).toHaveLength(2);
    expect(parse("columns: (w=900)").tree.children[0].opts).toEqual({ w: 900 });
    expect(parse("cols:").tree.children[0].type).toBe("columns");
  });

  it("puts panels side by side, touching, all as tall as the tallest", () => {
    const { ops, size } = draw(
      "columns:\n  box: A\n    text: one\n  box: B\n    text: one\n    text: two\n    text: three",
    );
    const [a, b] = frames(ops);
    expect(b.x).toBe(a.x + a.w);
    expect(a.h).toBe(b.h);
    expect(size).toEqual({ w: a.w + b.w, h: b.h });
  });

  it("takes (h=...) as the height of every panel", () => {
    const { ops } = draw("columns: (h=600)\n  box: A\n  box: B");
    expect(frames(ops).map((f) => f.h)).toEqual([600, 600]);
  });

  it("shares the width between (fill) panels, keeping fixed ones", () => {
    const { ops, size } = draw(
      "columns: (w=1000)\n  box: Nav (w=200)\n  box: Main (fill)\n  box: Info (w=300)",
    );
    expect(frames(ops).map((f) => f.w)).toEqual([200, 500, 300]);
    expect(size.w).toBe(1000);
  });

  it("takes (gap=...)", () => {
    const { ops } = draw("columns: (gap=10)\n  box: A\n  box: B");
    const [a, b] = frames(ops);
    expect(b.x).toBe(a.x + a.w + 10);
  });

  it("stretches tabs and textareas to the full height", () => {
    const { ops } = draw("columns: (h=400)\n  tabs: A | B\n  textarea: x");
    const area = rects(ops).find((r) => r.fill === colors.paper)!;
    expect(area.h).toBe(400);
  });
});

describe("(dark)", () => {
  it("fills a box with the dark colour, under its content", () => {
    const { ops } = draw("box (dark)\n  text: Menu");
    const panel = rects(ops)[0];
    expect(ops[0]).toBe(panel);
    expect(panel).toMatchObject({ fill: colors.dark, color: colors.dark });
  });

  it("draws text on it in the light colour", () => {
    const { ops } = draw("box: Title (dark)\n  text: Menu");
    expect(texts(ops).map((t) => t.color)).toEqual([colors.onDark, colors.onDark]);
  });

  it("keeps normal ink for buttons and fields on it", () => {
    const { ops } = draw("box (dark)\n  button: Save\n  input: x");
    for (const t of texts(ops)) expect(t).not.toHaveProperty("color");
  });

  it("has the same size as a normal box", () => {
    const spec = "box: T\n  text: one\n  button: two";
    expect(draw(spec.replace("box: T", "box: T (dark)")).size).toEqual(draw(spec).size);
  });

  it("works with (fill) children and a column height", () => {
    const { ops } = draw("columns: (h=300)\n  box (dark, w=200)\n    button: New (fill)");
    const panel = rects(ops)[0];
    expect(panel).toMatchObject({ w: 200, h: 300 });
    expect(rects(ops).find((r) => r.rounded)!.w).toBe(200 - 2 * DEFAULT_THEME.gap.pad);
  });
});
