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
const types = (nodes: SpecNode[]) => nodes.map((n) => n.type);

describe("parsing", () => {
  it.each([
    ["input", "input"],
    ["field", "input"],
    ["textbox", "input"],
    ["search", "search"],
    ["password", "password"],
    ["textarea", "textarea"],
    ["heading", "h1"],
    ["h1", "h1"],
    ["h2", "h2"],
    ["subheading", "h2"],
  ])("%s: is a %s", (keyword, type) => {
    const { tree, errors } = parse(`${keyword}: x`);
    expect(errors).toEqual([]);
    expect(types(tree.children)).toEqual([type]);
  });

  it("needs a colon", () => {
    expect(parse("input").errors).toHaveLength(1);
  });

  it("gives textarea its continuation lines", () => {
    expect(parse("textarea: one\ntwo").tree.children[0].body).toEqual(["two"]);
  });
});

describe("input", () => {
  it("is a white box with the text inside, at least 200 wide", () => {
    const { ops, size } = draw("input: Anna");
    expect(rects(ops)[0]).toMatchObject({ x: 0, y: 0, w: 200, h: LINE_H + 16, fill: "#ffffff" });
    expect(texts(ops)[0]).toMatchObject({ x: 10, text: "Anna" });
    expect(size).toEqual({ w: 200, h: LINE_H + 16 });
  });

  it("grows with long text, and with (w=...) or (fill)", () => {
    expect(draw(`input: ${"x".repeat(30)}`).size.w).toBe(30 * CHAR_W + 20);
    expect(draw("input: a (w=320)").size.w).toBe(320);
    expect(rects(draw("box (w=500)\n  input: a (fill)").ops)[0].w).toBe(
      500 - 2 * DEFAULT_THEME.gap.pad,
    );
  });

  it("can be empty", () => {
    const { ops } = draw("input:");
    expect(texts(ops)).toEqual([]);
    expect(rects(ops)).toHaveLength(1);
  });
});

describe("search", () => {
  it("has a search icon before the text", () => {
    const { ops } = draw("search: Find users");
    const [t] = texts(ops);
    expect(t.text).toBe("Find users");
    expect(t.x).toBeGreaterThan(10 + 10);
    expect(ops.some((o) => o.kind === "ellipse")).toBe(true);
  });

  it("says Search when empty", () => {
    expect(texts(draw("search:").ops)[0].text).toBe("Search");
  });
});

describe("password", () => {
  it("masks the text with one dot per character", () => {
    expect(texts(draw("password: secret").ops)[0].text).toBe("••••••");
  });

  it("shows eight dots when empty", () => {
    expect(texts(draw("password:").ops)[0].text).toBe("••••••••");
  });
});

describe("textarea", () => {
  it("shows every line and is at least 240 × 80", () => {
    const { ops, size } = draw("textarea: First line\nSecond line");
    expect(texts(ops)[0].text).toBe("First line\nSecond line");
    expect(size).toEqual({ w: 240, h: 80 });
  });

  it("draws a resize grip in the bottom-right corner", () => {
    const grip = lines(draw("textarea:").ops);
    expect(grip).toHaveLength(2);
    for (const l of grip) for (const [x, y] of l.points) expect(x > 220 && y > 60).toBe(true);
  });

  it("grows to (h=...)", () => {
    expect(draw("textarea: a (h=150)").size.h).toBe(150);
  });
});

describe("headings", () => {
  it("draw larger text: h1 1.75 times the base size, h2 1.375 times", () => {
    expect(texts(draw("h1: Users").ops)[0].fontSize).toBe(28);
    expect(texts(draw("heading: Users").ops)[0].fontSize).toBe(28);
    expect(texts(draw("h2: Details").ops)[0].fontSize).toBe(22);
  });

  it("scale with the font size setting", () => {
    const big = layout(
      parse("h1: A").tree,
      { x: 0, y: 0 },
      {
        measure: fakeMeasure,
        style: { ...style, fontSize: 20 },
      },
    );
    expect(texts(big.ops)[0].fontSize).toBe(35);
  });

  it("measure with their own font size", () => {
    const seen: number[] = [];
    layout(
      parse("h1: A").tree,
      { x: 0, y: 0 },
      {
        measure: (t, s) => (seen.push(s.fontSize), fakeMeasure(t, s)),
        style,
      },
    );
    expect(seen).toContain(28);
  });

  it("can hold icons", () => {
    const { ops } = draw("h2: {users} Team");
    expect(texts(ops)[0]).toMatchObject({ text: "Team", fontSize: 22 });
    expect(lines(ops).length).toBeGreaterThan(0);
  });

  it("stretch with (fill) like text", () => {
    expect(draw("row: (w=400)\n  h1: Users (fill)\n  button: {close}").size.w).toBe(400);
  });
});
