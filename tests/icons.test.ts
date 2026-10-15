import { describe, expect, it } from "vitest";
import { renderOps } from "../src/adapters/excalidraw";
import { renderSvg } from "../src/adapters/svg";
import { FONT_SIZE, ICON_NAMES, INK, layout, parse } from "../src/core";
import type { DrawOp, EllipseOp, RectOp, Style, TextOp } from "../src/core";
import { FakeEa } from "./helpers/fakeEa";
import { LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const ellipses = (ops: DrawOp[]) => ops.filter((o): o is EllipseOp => o.kind === "ellipse");
const S = Math.round(LINE_H * 0.8); // icon size with the fake measurer

function bounds(ops: DrawOp[]) {
  const xs: number[] = [],
    ys: number[] = [];
  for (const op of ops) {
    if (op.kind === "line") {
      op.points.forEach(([x, y]) => {
        xs.push(x);
        ys.push(y);
      });
    } else {
      xs.push(op.x, op.x + op.w);
      ys.push(op.y, op.y + op.h);
    }
  }
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

describe("icon:", () => {
  it.each(ICON_NAMES.map((n) => [n]))("draws %s inside its square", (name) => {
    const { tree, errors } = parse(`icon: ${name}`);
    expect(errors).toEqual([]);
    const { ops, size } = layout(tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
    expect(size).toEqual({ w: S, h: S });
    expect(ops.length).toBeGreaterThan(0);
    const b = bounds(ops);
    expect(b.x0).toBeGreaterThanOrEqual(0);
    expect(b.y0).toBeGreaterThanOrEqual(0);
    expect(b.x1).toBeLessThanOrEqual(S + 0.001);
    expect(b.y1).toBeLessThanOrEqual(S + 0.001);
  });

  it("has the M7 icons", () => {
    const m7 = "key warning refresh print database clock code ban cloud map hash network grid";
    expect(ICON_NAMES).toEqual(expect.arrayContaining(m7.split(" ")));
  });

  it("ignores case", () => {
    expect(parse("icon: Search").errors).toEqual([]);
  });

  it("takes its size from (w=...)", () => {
    expect(draw("icon: home (w=40)").size).toEqual({ w: 40, h: 40 });
  });

  it("reports an unknown name and draws a placeholder", () => {
    const { tree, errors } = parse("icon: unicorn");
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/^unknown icon "unicorn"; known icons: search, /);
    expect(tree.children).toHaveLength(1);
    expect(rects(draw("icon: unicorn").ops)).toHaveLength(1);
  });

  it("can't contain other components", () => {
    expect(parse("icon: home\n  button: A").errors).toHaveLength(1);
  });

  it("fills solid dots with the stroke colour", () => {
    const dot = ellipses(draw("icon: dot").ops)[0];
    expect(dot.fill).toBe(INK);
    const ea = new FakeEa();
    renderOps(ea, [dot], style);
    expect(ea.calls[0].style.backgroundColor).toBe(style.stroke);
    expect(renderSvg([dot], style)).toContain(`fill="${style.stroke}"`);
  });

  it("uses the disabled colour for a dot in a disabled component", () => {
    const dot = ellipses(draw("icon: dot (disabled)").ops)[0];
    const ea = new FakeEa();
    renderOps(ea, [dot], style);
    expect(ea.calls[0].style.backgroundColor).toBe("#adb5bd");
  });
});

describe("{icon} in labels", () => {
  it("draws the icon and the text beside it", () => {
    const { ops, size } = draw("text: {search} Find users");
    const [t] = texts(ops);
    expect(t.text).toBe("Find users");
    const gap = Math.round(S * 0.4);
    expect(t.x).toBe(S + gap);
    expect(size.w).toBe(S + gap + t.w);
    expect(bounds(ops.filter((o) => o.kind !== "text")).x1).toBeLessThanOrEqual(S);
  });

  it("handles icons between and after text", () => {
    const { ops } = draw("text: Next {chevron-right} then {dot}");
    expect(texts(ops).map((t) => t.text)).toEqual(["Next", "then"]);
    expect(ellipses(ops)).toHaveLength(1);
  });

  it("leaves unknown {names} as literal text", () => {
    const { ops } = draw("text: Hello {world}");
    expect(texts(ops).map((t) => t.text)).toEqual(["Hello {world}"]);
  });

  it("works on each line of a multi-line text", () => {
    const { ops, size } = draw("text: {home} Home\n{user} Profile");
    expect(texts(ops).map((t) => t.text)).toEqual(["Home", "Profile"]);
    expect(size.h).toBe(2 * LINE_H);
  });

  it("draws an icon and a label in a button", () => {
    const { ops } = draw("button: {plus} Add");
    expect(rects(ops)[0].w).toBeGreaterThan(80 - 1);
    expect(texts(ops).map((t) => t.text)).toEqual(["Add"]);
  });
});

describe("icon buttons", () => {
  it("are square when they have only icons", () => {
    const { ops, size } = draw("button: {filter}");
    expect(size.w).toBe(size.h);
    expect(rects(ops)[0]).toMatchObject({ w: size.w, rounded: true });
    expect(texts(ops)).toEqual([]);
  });

  it("are circles with (round)", () => {
    const { ops, size } = draw("button: {more} (round)");
    expect(rects(ops)).toEqual([]);
    expect(ellipses(ops)[0]).toMatchObject({ x: 0, y: 0, w: size.w, h: size.h, strokeWidth: 2 });
  });

  it("can be primary", () => {
    expect(rects(draw("button: *{plus}").ops)[0].fill).toBe("#a5d8ff");
  });

  it("keep text buttons as rounded rectangles with (round)", () => {
    expect(rects(draw("button: Save (round)").ops)[0].rounded).toBe(true);
  });
});
