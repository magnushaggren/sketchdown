import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, SpecNode, Style, TextOp } from "../src/core";
import { LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const text = (ops: DrawOp[], s: string) => texts(ops).find((t) => t.text === s);
const kids = (source: string): SpecNode[] => parse(source).tree.children;
const { colors } = DEFAULT_THEME;
/** Vertical lines: a divider before a trailing button or arrow. */
const dividers = (ops: DrawOp[]) =>
  lines(ops).filter(
    (l) => l.points.length === 2 && l.points[0][0] === l.points[1][0] && l.points[0][1] === 0,
  );

describe("parsing", () => {
  it("reads spin and its aliases, and the empty and stacked flags", () => {
    expect(kids("spin: 12\nnumber: 3\nstepper: 1").map((n) => n.type)).toEqual([
      "spin",
      "spin",
      "spin",
    ]);
    expect(kids("dropdown: (empty)")[0].opts).toEqual({ empty: 1 });
    expect(kids("details: A | b (stacked)")[0].opts).toEqual({ stacked: 1 });
  });

  it("takes spin as a field's component", () => {
    expect(kids("field: Count | spin: 4")[0].children[0]).toMatchObject({
      type: "spin",
      text: "4",
    });
  });

  it("reads a field's component right after the colon", () => {
    expect(kids("field: A | search:sales")[0].children[0].text).toBe("sales");
    expect(kids("field: A | input : x")[0].children[0]).toMatchObject({ type: "input", text: "x" });
  });
});

describe("(empty)", () => {
  it("draws a dropdown without text", () => {
    const { ops } = draw("dropdown: (empty)");
    expect(texts(ops)).toEqual([]);
    expect(rects(ops)).toHaveLength(1);
  });

  it("draws a password without dots, and a search without its default text", () => {
    expect(texts(draw("password: (empty)").ops)).toEqual([]);
    expect(texts(draw("search: (empty)").ops)).toEqual([]);
  });

  it("keeps an input's width and height", () => {
    expect(draw("input: (empty)").size).toEqual(draw("input:").size);
    expect(draw("dropdown: Sweden (empty)").size).toEqual(draw("dropdown: Sweden").size);
  });
});

describe("trailing {icon} button", () => {
  it("draws an icon at the end of an input as a button at the right edge", () => {
    const { ops, size } = draw("input: 2026-10-14 {calendar}");
    expect(text(ops, "2026-10-14")).toBeDefined();
    const [divider] = dividers(ops);
    expect(divider.points[0][0]).toBe(size.w - size.h);
    // the icon is drawn inside the button
    const inside = lines(ops).filter((l) => l !== divider && l.points[0][0] > size.w - size.h);
    expect(inside.length).toBeGreaterThan(0);
  });

  it("keeps the text clear of the button", () => {
    const { ops, size } = draw("input: A rather long value {edit}");
    const t = text(ops, "A rather long value")!;
    expect(t.x + t.w).toBeLessThanOrEqual(size.w - size.h);
  });

  it("works on search, after its own icon", () => {
    const { ops, size } = draw("search: Search... {edit}");
    expect(text(ops, "Search...")).toBeDefined();
    expect(dividers(ops)[0].points[0][0]).toBe(size.w - size.h);
  });

  it("works on a dropdown, before the arrow", () => {
    const plain = draw("dropdown: Sweden");
    const { ops, size } = draw("dropdown: Sweden {search}");
    expect(text(ops, "Sweden")).toBeDefined();
    expect(dividers(ops)).toHaveLength(2);
    expect(size.w).toBe(plain.size.w + size.h);
  });

  it("stays a leading icon at the start of the text", () => {
    expect(dividers(draw("input: {calendar} 2026-10-14").ops)).toEqual([]);
    expect(dividers(draw("input: {calendar}").ops)).toEqual([]);
  });

  it("leaves an unknown name as text", () => {
    const { ops } = draw("input: Price {euro}");
    expect(dividers(ops)).toEqual([]);
    expect(text(ops, "Price {euro}")).toBeDefined();
  });

  it("works with (empty)", () => {
    const { ops } = draw("search: {edit} (empty)");
    expect(texts(ops)).toEqual([]);
    expect(dividers(ops)).toHaveLength(1);
  });

  it("puts the button at the right edge of a (fill) field", () => {
    const { ops } = draw("box (w=400)\n  input: x {edit} (fill)");
    const outer = rects(ops).find((r) => r.fill === colors.paper)!;
    const divider = lines(ops).find(
      (l) => l.points.length === 2 && l.points[0][0] === l.points[1][0],
    )!;
    expect(divider.points[0][0]).toBe(outer.x + outer.w - outer.h);
  });
});

describe("spin", () => {
  it("draws a field with its value and up and down arrows at the right", () => {
    const { ops, size } = draw("spin: 12");
    expect(text(ops, "12")).toBeDefined();
    expect(rects(ops)[0]).toMatchObject({ x: 0, y: 0, w: size.w, h: size.h, fill: colors.paper });
    expect(size.h).toBe(LINE_H + 16);
    expect(size.w).toBeLessThan(120);
    const right = lines(ops).filter((l) => l.points.every(([x]) => x > size.w - 30));
    expect(right.length).toBeGreaterThanOrEqual(3); // divider, up, down
  });

  it("takes (w=...) and (fill)", () => {
    expect(draw("spin: 1 (w=160)").size.w).toBe(160);
    const { ops } = draw("box (w=400)\n  spin: 1 (fill)");
    expect(rects(ops).find((r) => r.fill === colors.paper)!.w).toBe(400 - 32);
  });

  it("can be empty", () => {
    expect(texts(draw("spin:").ops)).toEqual([]);
  });
});

describe("details (stacked)", () => {
  it("puts each label above its value", () => {
    const { ops } = draw("details: Owner | Anna Svensson (stacked)\nTeam | Platform");
    const owner = text(ops, "Owner")!,
      anna = text(ops, "Anna Svensson")!,
      team = text(ops, "Team")!;
    expect(owner.x).toBe(0);
    expect(anna.x).toBe(0);
    expect(anna.y).toBeGreaterThan(owner.y + owner.h - 1);
    expect(team.y).toBeGreaterThan(anna.y + anna.h);
  });

  it("draws the label small and grey, the value in normal ink", () => {
    const { ops } = draw("details: Owner | Anna (stacked)");
    expect(text(ops, "Owner")).toMatchObject({ color: colors.muted });
    expect(text(ops, "Owner")!.fontSize).toBeLessThan(FONT_SIZE);
    expect(text(ops, "Anna")!.color).toBeUndefined();
  });

  it("is as wide as its widest line", () => {
    const { size } = draw("details: A | A much longer value (stacked)");
    expect(size.w).toBe(
      fakeMeasure("A much longer value", { fontSize: FONT_SIZE, fontFamily: 5 }).w,
    );
  });
});
