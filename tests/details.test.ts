import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const { colors } = DEFAULT_THEME;
const ROW_H = LINE_H + 12;

describe("details", () => {
  it("parses, also as properties, with continuation lines as rows", () => {
    expect(parse("details: A | 1\nB | 2").tree.children[0]).toMatchObject({
      type: "details",
      text: "A | 1",
      body: ["B | 2"],
    });
    expect(parse("properties: A").tree.children[0].type).toBe("details");
  });

  it("lines up the values in a second column, grey", () => {
    const { ops, size } = draw("details: Phone | 070-123\nE-mail | anna@example.com");
    const [phone, number, mail, address] = texts(ops);
    const keyW = "E-mail".length * CHAR_W;
    expect(phone).toMatchObject({ text: "Phone", x: 0, y: 6 });
    expect(phone).not.toHaveProperty("color");
    expect(number).toMatchObject({ text: "070-123", x: keyW + 16, color: colors.muted });
    expect(mail.y).toBe(ROW_H + 6);
    expect(address.x).toBe(keyW + 16);
    expect(size).toEqual({ w: keyW + 16 + "anna@example.com".length * CHAR_W, h: 2 * ROW_H });
  });

  it("draws icons in labels", () => {
    const { ops } = draw("details: {phone} Phone | 070-123");
    expect(texts(ops).map((t) => t.text)).toEqual(["Phone", "070-123"]);
    expect(ops.some((o) => o.kind === "line")).toBe(true);
  });

  it("allows a row without a value", () => {
    const { ops } = draw("details: Notes\nPhone | 1");
    expect(texts(ops).map((t) => t.text)).toEqual(["Notes", "Phone", "1"]);
  });

  it("keeps the value only after the first |", () => {
    expect(texts(draw("details: Path | a | b").ops)[1].text).toBe("a | b");
  });

  it("uses the light colour for both columns on a dark panel", () => {
    const { ops } = draw("box (dark)\n  details: A | 1");
    expect(texts(ops).map((t) => t.color)).toEqual([colors.onDark, colors.onDark]);
  });
});
