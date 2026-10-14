import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, EllipseOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const ellipses = (ops: DrawOp[]) => ops.filter((o): o is EllipseOp => o.kind === "ellipse");
const { colors } = DEFAULT_THEME;
const ITEM_H = LINE_H + 16;

describe("nav", () => {
  it("parses, also as navigation, and needs a colon", () => {
    expect(parse("nav: A").tree.children[0].type).toBe("nav");
    expect(parse("navigation: A").tree.children[0].type).toBe("nav");
    expect(parse("nav").errors).toHaveLength(1);
  });

  it("lists items top to bottom from | and continuation lines", () => {
    const { ops, size } = draw("nav: Home | Users\nSettings");
    expect(texts(ops).map((t) => [t.text, t.y])).toEqual([
      ["Home", 8],
      ["Users", 8 + ITEM_H],
      ["Settings", 8 + 2 * ITEM_H],
    ]);
    expect(size).toEqual({ w: 120, h: 3 * ITEM_H });
  });

  it("highlights the item marked with *", () => {
    const { ops } = draw("nav: Home | *Users | Settings");
    const [hl] = rects(ops);
    expect(hl).toMatchObject({ fill: colors.primary, stroke: false, y: ITEM_H + 2 });
    expect(texts(ops)[1].text).toBe("Users");
  });

  it("highlights nothing without a *", () => {
    expect(rects(draw("nav: Home | Users").ops)).toEqual([]);
  });

  it("draws icons in items", () => {
    const { ops } = draw("nav: {home} Home | {users} Users");
    expect(texts(ops).map((t) => t.text)).toEqual(["Home", "Users"]);
    expect(lines(ops).length).toBeGreaterThan(2);
  });

  it("draws a divider for -", () => {
    const { ops, size } = draw("nav: Home | - | Log out");
    expect(lines(ops)).toHaveLength(1);
    expect(size.h).toBe(2 * ITEM_H + 16);
  });

  it("stretches with (fill) and (w=...)", () => {
    expect(draw("nav: A (w=250)").size.w).toBe(250);
    expect(draw("box (w=300)\n  nav: A (fill)").ops.length).toBeGreaterThan(0);
  });

  it("with (dark) draws its own dark background and light text, active item in normal ink", () => {
    const { ops } = draw("nav: Home | *Users (dark)");
    expect(rects(ops)[0]).toMatchObject({ fill: colors.dark });
    const [home, users] = texts(ops);
    expect(home.color).toBe(colors.onDark);
    expect(users).not.toHaveProperty("color");
  });

  it("takes light text from a dark box around it", () => {
    const { ops } = draw("box (dark)\n  nav: Home");
    expect(texts(ops)[0].color).toBe(colors.onDark);
  });

  it("fills the column height", () => {
    expect(draw("columns: (h=500)\n  nav: A (dark)").size.h).toBe(500);
  });
});

describe("avatar", () => {
  it("draws a circle twice the line height with the initials centred", () => {
    const { ops, size } = draw("avatar: MH");
    expect(size).toEqual({ w: 2 * LINE_H, h: 2 * LINE_H });
    expect(ellipses(ops)[0]).toMatchObject({ x: 0, y: 0, w: 2 * LINE_H, fill: colors.fill });
    const [t] = texts(ops);
    expect(t.text).toBe("MH");
    expect(t.x + t.w / 2).toBe(LINE_H);
  });

  it("shows a user icon when empty", () => {
    const { ops } = draw("avatar:");
    expect(texts(ops)).toEqual([]);
    expect(ellipses(ops).length).toBe(2);
  });

  it("takes its size from (w=...)", () => {
    expect(draw("avatar: A (w=64)").size).toEqual({ w: 64, h: 64 });
  });

  it("keeps normal ink on a dark panel", () => {
    expect(texts(draw("box (dark)\n  avatar: MH").ops)[0]).not.toHaveProperty("color");
  });
});
