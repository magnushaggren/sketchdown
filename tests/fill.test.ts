import { describe, expect, it } from "vitest";
import { eaMeasure, renderOps } from "../src/adapters/excalidraw";
import { renderSvg } from "../src/adapters/svg";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { FakeEa } from "./helpers/fakeEa";
import { fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const { pad, row: rowGap } = DEFAULT_THEME.gap;

describe("(fill) in a stack", () => {
  it("makes a button as wide as the widest sibling", () => {
    const { ops } = draw("dropdown: A very long option indeed\nbutton: OK (fill)");
    const [dropdown, button] = rects(ops);
    expect(button.w).toBe(dropdown.w);
  });

  it("makes a button as wide as the inside of its box", () => {
    const { ops } = draw("box: Panel (w=400)\n  text: Hello\n  button: *Save (fill)");
    const frame = rects(ops).find((r) => r.strokeWidth === 2 && !r.rounded)!;
    const button = rects(ops).find((r) => r.rounded)!;
    expect(frame.w).toBe(400);
    expect(button.w).toBe(400 - 2 * pad);
    expect(button.x).toBe(pad);
  });

  it("stretches inside tabs", () => {
    const { ops } = draw("tabs: A | B (w=500)\n  button: Go (fill)");
    const button = rects(ops).find((r) => r.rounded)!;
    expect(button.w).toBe(500 - 2 * pad);
  });

  it("stretches a grid by sharing the extra width between its columns", () => {
    const natural = draw("grid\na, b");
    const { ops } = draw("box (w=600)\n  grid (fill)\n  a, b");
    const frame = rects(ops).find((r) => r.strokeWidth === 2 && r.w !== 600)!;
    expect(frame.w).toBe(600 - 2 * pad);
    const divider = lines(ops).find((l) => l.points[0][0] === l.points[1][0])!;
    const naturalCol = rects(natural.ops)[0].w / 2;
    expect(divider.points[0][0] - frame.x).toBe(naturalCol + (600 - 2 * pad - 2 * naturalCol) / 2);
  });

  it("does nothing without (fill)", () => {
    const { ops } = draw("box: Panel (w=400)\n  button: Save");
    expect(rects(ops).find((r) => r.rounded)!.w).toBe(80);
  });
});

describe("(fill) in a row", () => {
  it("shares the row's width between fill children", () => {
    const { ops, size } = draw("row: (w=500)\n  button: Back\n  text: Title (fill)\n  button: X");
    expect(size.w).toBe(500);
    const [back, x] = rects(ops);
    expect(x.x + x.w).toBe(500);
    expect(back.x).toBe(0);
  });

  it("takes the width from a box when the row itself is (fill)", () => {
    const { ops } = draw("box (w=400)\n  row: (fill)\n    text: Users (fill)\n    button: Close");
    const close = rects(ops).find((r) => r.rounded)!;
    expect(close.x + close.w).toBe(400 - pad);
  });

  it("splits evenly between several fill children", () => {
    const { ops } = draw("row: (w=500)\n  button: A (fill)\n  button: B (fill)");
    const [a, b] = rects(ops);
    expect(a.w).toBe((500 - rowGap) / 2);
    expect(b.w).toBe(a.w);
  });

  it("keeps natural sizes when there is no width to share", () => {
    const { ops } = draw("row:\n  button: A (fill)\n  button: B");
    expect(rects(ops).map((r) => r.w)).toEqual([80, 80]);
  });

  it("is as wide as its (w=...) without fill children [M6]", () => {
    expect(draw("row: (w=700)\n  button: A").size.w).toBe(700);
  });

  it("takes its share as a fill child of another row [M6]", () => {
    const { ops } = draw("row: (w=500)\n  button: A\n  row: (fill)\n    text: B\n  button: C");
    const c = rects(ops)[1];
    expect(c.x + c.w).toBe(500);
  });

  it("works as a spacer when empty and (fill) [M6]", () => {
    const { ops } = draw(
      "box (w=400)\n  row: (fill)\n    button: Left\n    row: (fill)\n    button: Right",
    );
    const [left, right] = rects(ops).filter((r) => r.rounded);
    expect(left.x).toBe(pad);
    expect(right.x + right.w).toBe(400 - pad);
    expect(texts(ops).map((t) => t.text)).toEqual(["Left", "Right"]);
  });
});

describe("(disabled)", () => {
  const grey = DEFAULT_THEME.colors.disabled;

  it("greys out the strokes and text of a component", () => {
    const { ops } = draw("button: Save (disabled)");
    expect(rects(ops)[0].color).toBe(grey);
    expect(texts(ops)[0].color).toBe(grey);
  });

  it("applies to everything inside a disabled container, and nothing after it", () => {
    const { ops } = draw("box: A (disabled)\n  dropdown: x\nbutton: B");
    const coloured = ops.filter((o) => "color" in o).length;
    expect(coloured).toBe(ops.length - 2); // the button's rect and text
    expect(texts(ops)[texts(ops).length - 1]).not.toHaveProperty("color");
  });

  it("leaves ops of normal components without a color key", () => {
    for (const op of draw("button: Save").ops) expect(op).not.toHaveProperty("color");
  });
});

describe("adapters", () => {
  const ops: DrawOp[] = [
    {
      kind: "rect",
      x: 0,
      y: 0,
      w: 10,
      h: 10,
      fill: null,
      stroke: true,
      strokeWidth: 1,
      rounded: false,
      color: "#adb5bd",
    },
    {
      kind: "line",
      points: [
        [0, 0],
        [5, 5],
      ],
      strokeWidth: 1,
      color: "#adb5bd",
    },
    { kind: "text", x: 0, y: 0, w: 10, h: 10, text: "Hi", color: "#ffffff", fontSize: 28 },
  ];

  it("Excalidraw: uses an op's colour and font size", () => {
    const ea = new FakeEa();
    renderOps(ea, ops, style);
    expect(ea.calls.map((c) => c.style.strokeColor)).toEqual(["#adb5bd", "#adb5bd", "#ffffff"]);
    expect(ea.calls[2].style.fontSize).toBe(28);
  });

  it("Excalidraw: measures with a given font size", () => {
    const ea = new FakeEa();
    const measure = eaMeasure(ea);
    measure("x", { fontSize: 28, fontFamily: 5 });
    expect(ea.style.fontSize).toBe(28);
  });

  it("SVG: uses an op's colour and font size", () => {
    const svg = renderSvg(ops, style);
    expect(svg).toContain('stroke="#adb5bd"');
    expect(svg).toContain('fill="#ffffff" font-size="28"');
  });

  it("layout: passes a text's font size to the measurer", () => {
    const seen: number[] = [];
    layout(
      parse("button: A").tree,
      { x: 0, y: 0 },
      {
        measure: (t, s) => (seen.push(s.fontSize), fakeMeasure(t, s)),
        style,
      },
    );
    expect(seen.every((s) => s === FONT_SIZE)).toBe(true);
  });
});
