import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, INK, layout, parse } from "../src/core";
import type { DrawOp, EllipseOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const ellipses = (ops: DrawOp[]) => ops.filter((o): o is EllipseOp => o.kind === "ellipse");
const { colors } = DEFAULT_THEME;
const TAB_H = LINE_H + 16;

describe("tabs (segmented)", () => {
  const spec = "tabs: ACTIVE | *INACTIVE | ALL (segmented)";

  it("draws one strip with the active part filled and lines between parts", () => {
    const { ops, size } = draw(spec);
    const widths = ["ACTIVE", "INACTIVE", "ALL"].map((l) => l.length * CHAR_W + 32);
    expect(size).toEqual({ w: widths[0] + widths[1] + widths[2], h: TAB_H });
    const [active, strip] = rects(ops);
    expect(active).toMatchObject({ x: widths[0], w: widths[1], fill: colors.primary });
    expect(strip).toMatchObject({ x: 0, w: size.w, h: TAB_H, fill: null });
    expect(lines(ops)).toHaveLength(2);
  });

  it("has no panel frame", () => {
    expect(rects(draw(spec).ops)).toHaveLength(2);
  });

  it("stretches its parts evenly with (w=...)", () => {
    const { ops } = draw("tabs: A | *B (segmented, w=400)");
    expect(rects(ops)[0].w).toBe(200);
  });

  it("highlights the first part when none is starred", () => {
    expect(rects(draw("tabs: A | B (segmented)").ops)[0].x).toBe(0);
  });
});

describe("tabs (underline)", () => {
  it("draws a base line, a thick line under the active tab and grey inactive labels", () => {
    const { ops, size } = draw("tabs: CONTENT | *FILES (underline)");
    expect(rects(ops)).toEqual([]);
    const [base, active] = lines(ops);
    expect(base).toMatchObject({
      strokeWidth: 1,
      points: [
        [0, TAB_H],
        [size.w, TAB_H],
      ],
    });
    expect(active.strokeWidth).toBe(2);
    expect(active.points[0][0]).toBe("CONTENT".length * CHAR_W + 32);
    const [content, files] = texts(ops);
    expect(content.color).toBe(colors.muted);
    expect(files).not.toHaveProperty("color");
  });

  it("stacks children below without a frame", () => {
    const { ops, size } = draw("tabs: *A | B (underline)\n  text: Body");
    const body = texts(ops).find((t) => t.text === "Body")!;
    expect(body.y).toBe(TAB_H + DEFAULT_THEME.gap.stack);
    expect(size.h).toBe(TAB_H + DEFAULT_THEME.gap.stack + LINE_H);
  });

  it("draws icons in labels", () => {
    expect(
      texts(draw("tabs: {file} Files | *{users} People (underline)").ops).map((t) => t.text),
    ).toEqual(["Files", "People"]);
  });
});

describe("grid styles", () => {
  const rows = "Name, Status\nAnna, Active\nErik, Away\nLisa, Active\nOla, Away";

  it("(plain) drops the frame, column lines and header fill but keeps row lines", () => {
    const { ops } = draw(`grid (plain)\n${rows}`);
    expect(rects(ops)).toEqual([]);
    expect(lines(ops).every((l) => l.points[0][1] === l.points[1][1])).toBe(true);
    expect(lines(ops)).toHaveLength(4);
  });

  it("(striped) fills every other body row, starting with the second", () => {
    const { ops } = draw(`grid (striped)\n${rows}`);
    const stripes = rects(ops).filter((r) => r.fill === colors.stripe);
    const rowH = Math.max(LINE_H, 14) + 14;
    expect(stripes.map((r) => r.y)).toEqual([2 * rowH, 4 * rowH]);
  });

  it("lets a selected row win over a stripe", () => {
    const { ops } = draw("grid (striped)\nA\nb\n*c");
    expect(rects(ops).filter((r) => r.fill === colors.stripe)).toEqual([]);
    expect(rects(ops).some((r) => r.fill === colors.selected)).toBe(true);
  });

  it("draws {dot} and other icons in cells", () => {
    const { ops } = draw("grid (plain)\nName, Status\nAnna, {dot} Active");
    expect(ellipses(ops)[0].fill).toBe(INK);
    expect(texts(ops).map((t) => t.text)).toContain("Active");
  });
});
