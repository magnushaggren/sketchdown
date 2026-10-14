import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, LineOp, RectOp, Style, TextOp } from "../src/core";
import { LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const lines = (ops: DrawOp[]) => ops.filter((o): o is LineOp => o.kind === "line");
const text = (ops: DrawOp[], s: string) => texts(ops).find((t) => t.text === s)!;
const { colors } = DEFAULT_THEME;
const BAR = LINE_H + 20; // title bar, as on a box

describe("frames parse", () => {
  it.each([
    ["window", "window"],
    ["dialog", "dialog"],
    ["modal", "dialog"],
    ["browser", "browser"],
    ["phone", "phone"],
  ])("%s is a container, with or without a colon", (kw, type) => {
    const [a] = parse(`${kw}: Title\n  button: A`).tree.children;
    expect(a).toMatchObject({ type, text: "Title" });
    expect(a.children).toHaveLength(1);
    const [b] = parse(`${kw} (w=500)\n  button: A`).tree.children;
    expect(b).toMatchObject({ type, opts: { w: 500 } });
    expect(b.children).toHaveLength(1);
  });

  it("buttons is not a container and always fills", () => {
    const { tree, errors } = parse("buttons: A | B\n  button: C");
    expect(tree.children[0]).toMatchObject({ type: "buttons", opts: { fill: 1 } });
    expect(errors).toHaveLength(1);
    expect(parse("buttons").errors).toHaveLength(1);
  });
});

describe("window", () => {
  it("draws a white frame, a title bar with the title and three controls", () => {
    const { ops, size } = draw("window: Settings\n  button: A");
    const [frame] = rects(ops);
    expect(frame).toMatchObject({ x: 0, y: 0, strokeWidth: 2, fill: colors.paper });
    expect(size).toEqual({ w: frame.w, h: frame.h });
    expect(text(ops, "Settings")).toMatchObject({ x: 12, y: 10 });
    expect(lines(ops)[0].points).toEqual([
      [0, BAR],
      [frame.w, BAR],
    ]);
    // the maximise control is a square near the right end of the bar
    const max = rects(ops).find((r) => r.w === 17)!;
    expect(max).toMatchObject({ y: (BAR - 17) / 2, h: 17 });
    expect(max.x).toBeGreaterThan(frame.w - 80);
  });

  it("draws the frame before its content, so the content stays on top", () => {
    const { ops } = draw("window: W\n  button: A");
    expect(ops.indexOf(rects(ops)[0])).toBe(0);
    expect(text(ops, "A").y).toBe(BAR + 12 + 10);
  });

  it("is at least 320 wide, and 200 below the bar when empty", () => {
    expect(draw("window: W").size).toEqual({ w: 320, h: BAR + 200 });
    expect(draw("window: W (w=600, h=400)").size).toEqual({ w: 600, h: 400 });
  });

  it("stretches (fill) children to its inner width", () => {
    const { ops } = draw("window: W (w=500)\n  button: A (fill)");
    expect(rects(ops).find((r) => r.rounded)!.w).toBe(500 - 32);
  });
});

describe("dialog", () => {
  it("draws a shadow under a white frame, and only a close control", () => {
    const { ops, size } = draw("dialog: Delete user?");
    const [shadow, frame] = rects(ops);
    expect(shadow).toMatchObject({ x: 8, y: 8, stroke: false, fill: colors.disabled });
    expect(frame).toMatchObject({ x: 0, y: 0, fill: colors.paper, w: shadow.w, h: shadow.h });
    expect(size).toEqual({ w: frame.w + 8, h: frame.h + 8 });
    expect(rects(ops)).toHaveLength(2);
    // title bar line, then the two strokes of the close icon
    expect(lines(ops)).toHaveLength(3);
  });

  it("is at least 280 wide and 120 below the bar when empty", () => {
    const { ops } = draw("dialog: D");
    expect(rects(ops)[1]).toMatchObject({ w: 280, h: BAR + 120 });
  });

  it("keeps the shadow inside a (fill) slot", () => {
    const { ops } = draw("box (w=400)\n  dialog: D (fill)");
    expect(rects(ops)[1].w).toBe(400 - 32 - 8);
  });
});

describe("browser", () => {
  it("draws a tab with the title and an address bar with the url", () => {
    const { ops } = draw("browser: My app | example.com");
    const title = text(ops, "My app");
    const url = text(ops, "example.com");
    expect(url.color).toBe(colors.muted);
    expect(url.y).toBeGreaterThan(title.y + LINE_H);
    // the tab outline is one line that rises around the title
    const tab = lines(ops)[0];
    expect(tab.points[0]).toEqual([0, LINE_H + 12]);
    expect(Math.min(...tab.points.map((p) => p[1]))).toBe(6);
    // the address field is a white rounded rectangle
    expect(rects(ops).find((r) => r.fill === colors.paper && r.rounded)).toBeDefined();
  });

  it("leaves out the tab without a title", () => {
    const { ops } = draw("browser: | example.com");
    expect(texts(ops).map((t) => t.text)).toEqual(["example.com"]);
    const field = rects(ops).find((r) => r.rounded)!;
    expect(field.y).toBe(6);
  });

  it("is at least 480 wide", () => {
    expect(draw("browser: A").size.w).toBe(480);
  });
});

describe("phone", () => {
  it("is 375 by 667 with rounded corners by default", () => {
    const { ops, size } = draw("phone:");
    expect(size).toEqual({ w: 375, h: 667 });
    expect(rects(ops)[0]).toMatchObject({ w: 375, h: 667, rounded: true, strokeWidth: 2 });
  });

  it("stays 667 high with a little content", () => {
    expect(draw("phone:\n  button: A").size.h).toBe(667);
  });

  it("takes its size from (w=...) and (h=...)", () => {
    expect(draw("phone: (w=320, h=568)").size).toEqual({ w: 320, h: 568 });
  });

  it("draws a status bar with the time, and the title centred in an app bar", () => {
    const { ops } = draw("phone: Users");
    expect(text(ops, "9:41")).toMatchObject({ x: 24 });
    const title = text(ops, "Users");
    expect(title.x + title.w / 2).toBe(375 / 2);
  });

  it("puts the content under the bars", () => {
    const { ops } = draw("phone:\n  button: A");
    const noTitle = text(ops, "A").y;
    expect(text(draw("phone: T\n  button: A").ops, "A").y).toBe(noTitle + BAR);
  });
});

describe("buttons", () => {
  it("puts the buttons side by side on the right of the parent's width", () => {
    const { ops } = draw("dialog: D (w=400)\n  buttons: Cancel | *Delete");
    const [cancel, del] = rects(ops).filter((r) => r.rounded);
    expect(del.fill).toBe(colors.primary);
    expect(del.x + del.w).toBe(400 - 16);
    expect(cancel.x + cancel.w + 12).toBe(del.x);
  });

  it("takes its natural width at the top level alone", () => {
    const { size } = draw("buttons: A | B");
    expect(size).toEqual({ w: 80 + 12 + 80, h: LINE_H + 20 });
  });

  it("also splits on commas", () => {
    expect(texts(draw("buttons: No, Yes").ops).map((t) => t.text)).toEqual(["No", "Yes"]);
  });

  it("greys out with (disabled)", () => {
    const { ops } = draw("buttons: A | B (disabled)");
    expect(texts(ops).every((t) => t.color === colors.disabled)).toBe(true);
  });
});

describe("frames on a dark panel", () => {
  it("keep the normal ink, since they are white", () => {
    expect(text(draw("box (dark)\n  window: W").ops, "W")).not.toHaveProperty("color");
  });
});
