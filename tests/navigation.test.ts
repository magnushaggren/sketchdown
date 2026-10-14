import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const text = (ops: DrawOp[], s: string) => texts(ops).find((t) => t.text === s)!;
const { colors } = DEFAULT_THEME;
const S = Math.round(LINE_H * 0.8); // icon size
const GAP = Math.round(S * 0.4);

describe("breadcrumb", () => {
  it("parses, also as breadcrumbs and crumbs", () => {
    for (const kw of ["breadcrumb", "breadcrumbs", "crumbs"]) {
      expect(parse(`${kw}: A > B`).tree.children[0].type).toBe("breadcrumb");
    }
  });

  it("draws links with chevrons between them, the last one as plain text", () => {
    const { ops, size } = draw("breadcrumb: Home > Users > Anna");
    const users = 4 * CHAR_W + GAP + S + GAP;
    const anna = users + 5 * CHAR_W + GAP + S + GAP;
    expect(texts(ops).map((t) => [t.text, t.x, t.color])).toEqual([
      ["Home", 0, colors.link],
      ["Users", users, colors.link],
      ["Anna", anna, undefined],
    ]);
    expect(size).toEqual({ w: anna + 4 * CHAR_W, h: LINE_H });
  });

  it("makes the item marked with * the current one", () => {
    const { ops } = draw("breadcrumb: Home > *Users > Anna");
    expect(texts(ops).map((t) => t.color)).toEqual([colors.link, undefined, colors.link]);
    expect(texts(ops)[1].text).toBe("Users");
  });

  it("splits on | when there is no >", () => {
    expect(texts(draw("breadcrumb: A | B").ops).map((t) => t.text)).toEqual(["A", "B"]);
  });

  it("keeps icons in items", () => {
    const { ops } = draw("breadcrumb: {home} Home > Anna");
    expect(text(ops, "Home").color).toBe(colors.link);
  });
});

describe("pagination", () => {
  it("parses, also as pager and pages", () => {
    for (const kw of ["pagination", "pager", "pages"]) {
      expect(parse(`${kw}: 1 2`).tree.children[0].type).toBe("pagination");
    }
  });

  it("draws a square box per page, the starred one filled", () => {
    const { ops, size } = draw("pagination: 1 *2 3");
    const B = LINE_H + 12;
    expect(rects(ops).map((r) => [r.x, r.w, r.h, r.fill])).toEqual([
      [0, B, B, colors.paper],
      [B + 6, B, B, colors.primary],
      [2 * (B + 6), B, B, colors.paper],
    ]);
    expect(text(ops, "2").x).toBe(B + 6 + (B - CHAR_W) / 2);
    expect(size).toEqual({ w: 3 * B + 12, h: B });
  });

  it("draws < and > as chevrons and … without a box", () => {
    const { ops } = draw("pagination: < 1 … 10 >");
    expect(rects(ops)).toHaveLength(4);
    expect(texts(ops).map((t) => t.text)).toEqual(["1", "…", "10"]);
    expect(lines(ops)).toHaveLength(2);
  });

  it("widens boxes for long numbers", () => {
    expect(rects(draw("pagination: 1000").ops)[0].w).toBe(4 * CHAR_W + 16);
  });
});

describe("menu", () => {
  const ITEM = LINE_H + 12;

  it("parses, also as contextmenu", () => {
    expect(parse("menu: A").tree.children[0].type).toBe("menu");
    expect(parse("contextmenu: A").tree.children[0].type).toBe("menu");
  });

  it("draws a white frame with one item per line", () => {
    const { ops, size } = draw("menu: Open\nSave\nClose");
    const [frame] = rects(ops);
    expect(frame).toMatchObject({ x: 0, y: 0, fill: colors.paper, strokeWidth: 2 });
    expect(texts(ops).map((t) => [t.text, t.x, t.y])).toEqual([
      ["Open", 12, 4 + 6],
      ["Save", 12, 4 + ITEM + 6],
      ["Close", 12, 4 + 2 * ITEM + 6],
    ]);
    expect(size).toEqual({ w: 160, h: 3 * ITEM + 8 });
  });

  it("right-aligns grey shortcuts after |", () => {
    const { ops, size } = draw("menu: Copy | Ctrl+C\nPaste | Ctrl+V");
    const c = text(ops, "Ctrl+C");
    expect(c.color).toBe(colors.muted);
    expect(c.x + c.w).toBe(size.w - 12);
  });

  it("draws a divider for -", () => {
    const { ops, size } = draw("menu: Open\n-\nQuit");
    expect(lines(ops)).toHaveLength(1);
    expect(size.h).toBe(2 * ITEM + 9 + 8);
  });

  it("highlights the item marked with *", () => {
    const { ops } = draw("menu: Open\n*Save");
    expect(rects(ops)[1]).toMatchObject({ fill: colors.primary, stroke: false, y: 4 + ITEM + 2 });
    expect(text(ops, "Save")).not.toHaveProperty("color");
  });

  it("puts check marks in a gutter, and a chevron after > for a submenu", () => {
    const { ops } = draw("menu: [x] Ruler\n[ ] Grid\nZoom >");
    expect(text(ops, "Ruler").x).toBe(12 + S + 8);
    expect(text(ops, "Grid").x).toBe(12 + S + 8);
    expect(text(ops, "Zoom").x).toBe(12 + S + 8);
    // the check icon is one line, the chevron another
    expect(lines(ops)).toHaveLength(2);
  });

  it("stretches with (w=...)", () => {
    expect(draw("menu: A (w=250)").size.w).toBe(250);
  });
});

describe("tree", () => {
  const ROW = LINE_H + 8;
  const TEXT = S + 4;

  it("parses, keeping the indentation of its lines", () => {
    const [t] = parse("tree: Project\n  - src\n    index.ts").tree.children;
    expect(t).toMatchObject({ type: "tree", text: "Project", body: ["  - src", "    index.ts"] });
  });

  it("indents each level, with chevrons for folders", () => {
    const { ops, size } = draw("tree: Project\n  - src\n    index.ts\n  + docs");
    expect(texts(ops).map((t) => [t.text, t.x, t.y])).toEqual([
      ["Project", TEXT, 4],
      ["src", 20 + TEXT, ROW + 4],
      ["index.ts", 40 + TEXT, 2 * ROW + 4],
      ["docs", 20 + TEXT, 3 * ROW + 4],
    ]);
    // chevron-down for src, chevron-right for docs: one line each
    expect(lines(ops)).toHaveLength(2);
    expect(size).toEqual({ w: 40 + TEXT + 8 * CHAR_W, h: 4 * ROW });
  });

  it("ranks indentation, so 4 spaces work like 2", () => {
    const xs = (src: string) => texts(draw(src).ops).map((t) => t.x);
    expect(xs("tree:\n    a\n        b\n    c")).toEqual(xs("tree:\n  a\n    b\n  c"));
    expect(xs("tree:\na\n  b")).toEqual([TEXT, 20 + TEXT]);
  });

  it("highlights the row marked with *", () => {
    const { ops } = draw("tree: a\n  *b\n  + *c");
    const sel = rects(ops).filter((r) => r.fill === colors.selected);
    expect(sel.map((r) => r.y)).toEqual([ROW, 2 * ROW]);
    expect(texts(ops).map((t) => t.text)).toEqual(["a", "b", "c"]);
  });

  it("allows icons", () => {
    expect(text(draw("tree: {folder} src").ops, "src").x).toBe(TEXT + S + GAP);
  });

  it("keeps -grey- text apart from the - marker", () => {
    const { ops } = draw("tree: -old-");
    expect(text(ops, "old").color).toBe(colors.disabled);
    expect(lines(ops)).toHaveLength(0);
  });
});
