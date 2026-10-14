import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const { colors } = DEFAULT_THEME;

describe("[link] in labels", () => {
  it("draws the link blue and underlined, keeping the spaces around it", () => {
    const { ops, size } = draw("text: Forgot [password]?");
    expect(texts(ops).map((t) => [t.text, t.x, t.color])).toEqual([
      ["Forgot", 0, undefined],
      ["password", 7 * CHAR_W, colors.link],
      ["?", 15 * CHAR_W, undefined],
    ]);
    expect(lines(ops)).toEqual([
      {
        kind: "line",
        points: [
          [7 * CHAR_W, LINE_H - 2],
          [15 * CHAR_W, LINE_H - 2],
        ],
        strokeWidth: 1,
        color: colors.link,
      },
    ]);
    expect(size.w).toBe(16 * CHAR_W);
  });

  it("handles several links on a line", () => {
    const { ops } = draw("text: [Terms] and [Privacy]");
    expect(texts(ops).map((t) => t.color)).toEqual([colors.link, undefined, colors.link]);
  });

  it("works in buttons, headings and grid cells", () => {
    expect(texts(draw("button: [Help]").ops)[0].color).toBe(colors.link);
    expect(texts(draw("h2: See [docs]").ops)[1]).toMatchObject({ color: colors.link });
    const grid = draw("grid\nName, Link\nAnna, [Open]").ops;
    expect(texts(grid).find((t) => t.text === "Open")!.color).toBe(colors.link);
  });

  it("leaves checkbox and toggle marks alone", () => {
    for (const s of ["[x] done", "[ ] todo", "[on] Wi-Fi", "[]"]) {
      expect(texts(draw(`text: ${s}`).ops).map((t) => t.text)).toEqual([s]);
    }
  });

  it("is grey, not blue, in a disabled component", () => {
    const { ops } = draw("text: Read [more] (disabled)");
    expect(texts(ops).every((t) => t.color === colors.disabled)).toBe(true);
    expect(lines(ops)[0].color).toBe(colors.disabled);
  });
});

describe("-disabled- in labels", () => {
  it("draws the text grey", () => {
    const { ops } = draw("text: -Archived- users");
    expect(texts(ops).map((t) => [t.text, t.x, t.color])).toEqual([
      ["Archived", 0, colors.disabled],
      ["users", 9 * CHAR_W, undefined],
    ]);
  });

  it("needs a space or the line's end around it", () => {
    for (const s of ["070-123 45-67", "2021-03-01", "a - b", "e-mail", "--", "-x - y-"]) {
      expect(texts(draw(`text: ${s}`).ops).map((t) => t.text)).toEqual([s]);
    }
  });

  it("allows punctuation after it", () => {
    expect(texts(draw("text: Not -this-, that").ops)[1]).toMatchObject({
      text: "this",
      color: colors.disabled,
    });
  });

  it("mixes with icons", () => {
    const { ops } = draw("nav: {home} Home | {trash} -Deleted-");
    expect(texts(ops).find((t) => t.text === "Deleted")!.color).toBe(colors.disabled);
  });
});

describe("link:", () => {
  it("draws its text as a link", () => {
    const { ops, size } = draw("link: Forgot password?");
    expect(texts(ops)).toEqual([
      expect.objectContaining({ text: "Forgot password?", x: 0, y: 0, color: colors.link }),
    ]);
    expect(lines(ops)).toHaveLength(1);
    expect(size).toEqual({ w: 16 * CHAR_W, h: LINE_H });
  });

  it("keeps icons", () => {
    const { ops } = draw("link: {file} Report.pdf");
    expect(texts(ops)[0]).toMatchObject({ text: "Report.pdf", color: colors.link });
  });
});

describe("paragraph:", () => {
  it("parses, also as p and lorem", () => {
    expect(parse("paragraph: x").tree.children[0].type).toBe("paragraph");
    expect(parse("p: x").tree.children[0].type).toBe("paragraph");
    expect(parse("lorem:").tree.children[0].type).toBe("paragraph");
  });

  it("wraps its text to 320 wide in one text element", () => {
    const words = "one two three four five six seven eight nine ten eleven twelve";
    const { ops, size } = draw(`paragraph: ${words} (w=200)`);
    const [t] = texts(ops);
    expect(texts(ops)).toHaveLength(1);
    expect(t.text.split("\n").every((l) => l.length * CHAR_W <= 200)).toBe(true);
    expect(t.text.replace(/\n/g, " ")).toBe(words);
    expect(size.w).toBe(200);
  });

  it("is 320 wide by default and joins continuation lines", () => {
    const { ops, size } = draw("paragraph: First line\nsecond line");
    expect(texts(ops)[0].text).toBe("First line second line");
    expect(size.w).toBe(320);
  });

  it("draws 4 lines of placeholder text for lorem, or (lines=...)", () => {
    expect(texts(draw("paragraph: lorem").ops)[0].text.split("\n")).toHaveLength(4);
    expect(texts(draw("lorem: (lines=2)").ops)[0].text.split("\n")).toHaveLength(2);
    expect(texts(draw("lorem:").ops)[0].text).toMatch(/^Lorem ipsum/);
  });

  it("stretches with (fill)", () => {
    expect(draw("box (w=500)\n  paragraph: lorem (fill)").size.w).toBe(500);
    const { ops } = draw("box (w=500)\n  paragraph: lorem (fill)");
    expect(texts(ops)[0].text.split("\n")[0].length * CHAR_W).toBeGreaterThan(320);
  });
});

describe("paragraph: very wide", () => {
  it("still fills its lines", () => {
    expect(texts(draw("lorem: (w=20000, lines=3)").ops)[0].text.split("\n")).toHaveLength(3);
  });

  it("cuts real text at (lines=...)", () => {
    expect(texts(draw("p: a b c d e f (w=30, lines=2)").ops)[0].text).toBe("a b\nc d");
  });
});
