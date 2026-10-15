import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, SpecNode, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const text = (ops: DrawOp[], s: string) => texts(ops).find((t) => t.text === s);
const kids = (source: string): SpecNode[] => parse(source).tree.children;
const { pad, stack: STACK } = DEFAULT_THEME.gap;
const { colors } = DEFAULT_THEME;
const BAR = LINE_H + 20; // a title bar's height
/** Lines entirely inside a region: the chevron's strokes. */
const linesIn = (ops: DrawOp[], x0: number, y0: number, x1: number, y1: number) =>
  lines(ops).filter((l) => l.points.every(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1));

describe("parsing", () => {
  it("reads the new flags and section as a container", () => {
    const [box, section, row] = kids(
      "box: A (collapsible)\nsection: {users} Owners (count=3, collapsed)\n  text: x\nrow (top)",
    );
    expect(box.opts).toEqual({ collapsible: 1 });
    expect(section).toMatchObject({
      type: "section",
      text: "{users} Owners",
      opts: { count: 3, collapsed: 1 },
    });
    expect(section.children.map((c) => c.type)).toEqual(["text"]);
    expect(row.opts).toEqual({ top: 1 });
  });
});

describe("box (collapsible) and (collapsed)", () => {
  it("adds a chevron at the right end of the title bar", () => {
    const { ops, size } = draw("box: Domain (collapsible)\n  text: Inside");
    expect(linesIn(ops, size.w - 40, 0, size.w, BAR).length).toBeGreaterThan(0);
    expect(
      linesIn(draw("box: Domain\n  text: Inside").ops, size.w - 40, 0, size.w, BAR - 1),
    ).toEqual([]);
  });

  it("draws only the title bar when collapsed", () => {
    const { ops, size } = draw("box: Journal (collapsed)\n  text: Inside");
    expect(text(ops, "Inside")).toBeUndefined();
    expect(size.h).toBe(BAR);
    expect(linesIn(ops, size.w - 40, 0, size.w, BAR - 1).length).toBeGreaterThan(0);
  });

  it("keeps a collapsed box as wide as its slot", () => {
    const { size } = draw("box (w=400)\n  box: Journal (collapsed, fill)\n    text: x");
    expect(size.w).toBe(400);
  });

  it("works on a form", () => {
    const { ops } = draw("form: Domain (collapsed)\n  field: A | input: x");
    expect(text(ops, "A")).toBeUndefined();
  });
});

describe("section", () => {
  it("draws a header line and its children below it, without a frame", () => {
    const { ops, size } = draw("section: Identity (count=3)\n  text: First");
    expect(rects(ops)).toEqual([]);
    expect(text(ops, "Identity")).toMatchObject({ x: 0, y: 0 });
    expect(text(ops, "First")!.y).toBe(LINE_H + STACK);
    expect(size.h).toBe(2 * LINE_H + STACK);
  });

  it("puts the count in grey and a chevron at the right edge", () => {
    const { ops, size } = draw("section: Identity (count=3)\n  text: A much longer child");
    const count = text(ops, "3")!;
    expect(count.color).toBe(colors.muted);
    expect(count.x + count.w).toBeLessThan(size.w);
    expect(linesIn(ops, count.x + count.w, 0, size.w, LINE_H).length).toBeGreaterThan(0);
    expect(size.w).toBe(19 * CHAR_W);
  });

  it("is at least as wide as its header", () => {
    const { size } = draw("section: A long section title (count=12)\n  text: x");
    expect(size.w).toBeGreaterThan(22 * CHAR_W);
  });

  it("hides its children when collapsed", () => {
    const { ops, size } = draw("section: Ownership (collapsed)\n  text: Hidden");
    expect(text(ops, "Hidden")).toBeUndefined();
    expect(size.h).toBe(LINE_H);
  });

  it("stretches with (fill), the chevron at the far right", () => {
    const { ops } = draw("box (w=400)\n  section: Identity (fill)\n    text: x");
    const right = Math.max(
      ...lines(ops)
        .flatMap((l) => l.points.map(([x]) => x))
        .filter((x) => x < 400),
    );
    expect(right).toBeGreaterThan(400 - pad - 4);
    expect(right).toBeLessThanOrEqual(400 - pad);
  });

  it("lets its children fill its width", () => {
    const { ops } = draw("box (w=400)\n  section: Identity (fill)\n    input: x (fill)");
    const input = rects(ops).find((r) => r.fill === colors.paper)!;
    expect(input.x + input.w).toBe(400 - pad);
  });
});

describe("box (plain)", () => {
  it("draws no frame and no padding", () => {
    const { ops, size } = draw("box (plain)\n  button: A\n  button: B");
    const [a, b] = rects(ops);
    expect(a).toMatchObject({ x: 0, y: 0 });
    expect(b.y).toBe(a.h + STACK);
    expect(size).toEqual({ w: a.w, h: a.h + STACK + b.h });
  });

  it("shows a title as a line of text above the content", () => {
    const { ops } = draw("box: Group (plain)\n  button: A");
    expect(text(ops, "Group")).toMatchObject({ x: 0, y: 0 });
    expect(rects(ops)[0].y).toBe(LINE_H + STACK);
    expect(lines(ops)).toEqual([]);
  });

  it("takes (w=...) and a fill slot", () => {
    expect(draw("box (plain, w=300)\n  text: x").size.w).toBe(300);
    const { ops } = draw("box (w=400)\n  box (plain, fill)\n    input: x (fill)");
    const input = rects(ops).find((r) => r.fill === colors.paper)!;
    expect(input.x + input.w).toBe(400 - pad);
  });
});

describe("row (top)", () => {
  it("aligns its children at the top", () => {
    const { ops } = draw("row (top)\n  textarea: tall\n  button: A");
    const button = rects(ops).find((r) => r.rounded)!;
    expect(button.y).toBe(0);
  });
});
