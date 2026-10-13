import { describe, expect, it } from "vitest";
import { EXAMPLE } from "../src/constants";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, TextOp, TextStyle } from "../src/core";
import { NEW_USER } from "./fixtures/specs";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: TextStyle = { fontSize: FONT_SIZE, fontFamily: 5 };
const draw = (source: string, x = 0, y = 0) =>
  layout(parse(source).tree, { x, y }, { measure: fakeMeasure, style });

const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");

describe("snapshots", () => {
  it("draws the prototype's example", () => {
    expect(draw(EXAMPLE)).toMatchSnapshot();
  });

  it("draws the New user box form", () => {
    expect(draw(NEW_USER)).toMatchSnapshot();
  });
});

describe("layout", () => {
  it("returns the overall size and moves with the origin", () => {
    const a = draw("button: Save");
    const b = draw("button: Save", 10, 20);
    expect(a.size).toEqual({ w: 80, h: LINE_H + 20 });
    expect(b.size).toEqual(a.size);
    expect(rects(b.ops)[0]).toMatchObject({ x: 10, y: 20, w: 80, h: LINE_H + 20 });
  });

  it("stacks top-level components with the root gap", () => {
    const { ops, size } = draw("button: A\nbutton: B");
    const [a, b] = rects(ops);
    expect(b.y - (a.y + a.h)).toBe(DEFAULT_THEME.gap.root);
    expect(size.h).toBe(a.h + DEFAULT_THEME.gap.root + b.h);
  });

  it("measures row children without drawing them twice", () => {
    const { ops } = draw("row:\n  button: A\n  button: B\n  text: C");
    expect(rects(ops)).toHaveLength(2);
    expect(texts(ops).map((t) => t.text)).toEqual(["A", "B", "C"]);
  });

  it("centres row children vertically and spaces them with the row gap", () => {
    const { ops } = draw("row:\n  button: A\n  text: B");
    const [button] = rects(ops);
    const label = texts(ops)[1];
    expect(label.x).toBe(button.x + button.w + DEFAULT_THEME.gap.row);
    expect(label.y + label.h / 2).toBe(button.y + button.h / 2);
  });

  it("passes the injected text style to the measure function", () => {
    const seen: TextStyle[] = [];
    layout(
      parse("button: A").tree,
      { x: 0, y: 0 },
      {
        measure: (text, s) => {
          seen.push(s);
          return fakeMeasure(text, s);
        },
        style: { fontSize: 20, fontFamily: 2 },
      },
    );
    expect(seen).toEqual([{ fontSize: 20, fontFamily: 2 }]);
  });

  it("measures an empty string as a space", () => {
    const asked: string[] = [];
    layout(
      parse("grid\nA, B\n1").tree,
      { x: 0, y: 0 },
      {
        measure: (text, s) => {
          asked.push(text);
          return fakeMeasure(text, s);
        },
        style,
      },
    );
    expect(asked).toEqual(["A", "B", "1", " "]);
  });

  it("uses the theme it is given", () => {
    const theme = { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, primary: "#ff0000" } };
    const { ops } = layout(
      parse("button: *Go").tree,
      { x: 0, y: 0 },
      { measure: fakeMeasure, style, theme },
    );
    expect(rects(ops)[0].fill).toBe("#ff0000");
  });
});

describe("draw ops", () => {
  it("carries the measured size on text ops", () => {
    const [t] = texts(draw("text: Hello\nworld!").ops);
    expect(t).toEqual({
      kind: "text",
      x: 0,
      y: 0,
      w: 6 * CHAR_W,
      h: 2 * LINE_H,
      text: "Hello\nworld!",
    });
  });

  it("emits no text op for an empty label", () => {
    expect(texts(draw("checkbox: [x]").ops)).toEqual([]);
  });

  it("describes a primary button as a rounded, filled rect with a thick stroke", () => {
    expect(rects(draw("button: *Save").ops)[0]).toMatchObject({
      fill: DEFAULT_THEME.colors.primary,
      stroke: true,
      strokeWidth: 2,
      rounded: true,
    });
  });

  it("draws grid row fills without a stroke", () => {
    const fills = rects(draw("grid\nA, B\n*1, 2").ops).filter((r) => !r.stroke);
    expect(fills.map((r) => r.fill)).toEqual([
      DEFAULT_THEME.colors.fill,
      DEFAULT_THEME.colors.selected,
    ]);
  });

  it("removes repeated points when the first tab is selected", () => {
    const outline = lines(draw("tabs: *One | Two").ops)[0];
    expect(outline.points).toHaveLength(5);
    expect(lines(draw("tabs: One | *Two").ops)[0].points).toHaveLength(6);
  });
});
