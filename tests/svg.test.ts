import { describe, expect, it } from "vitest";
import { fontFamilyCss, renderSvg } from "../src/adapters/svg";
import { EXAMPLE } from "../src/constants";
import { FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, Style } from "../src/core";
import { fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const svgOf = (source: string, s: Style = style) =>
  renderSvg(layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style: s }).ops, s);
const count = (svg: string, tag: string) => svg.split(`<${tag} `).length - 1;

describe("renderSvg", () => {
  it("draws the prototype's example", () => {
    expect(svgOf(EXAMPLE)).toMatchSnapshot();
  });

  it("gives the same output every time", () => {
    expect(svgOf(EXAMPLE)).toBe(svgOf(EXAMPLE));
  });

  it("does not redraw earlier shapes when one is added after them", () => {
    const one = svgOf("button: A");
    const two = svgOf("button: A\nbutton: B");
    const body = one.slice(one.indexOf(">") + 1, -"</svg>".length);
    expect(two).toContain(body);
  });

  it("sizes the image to the drawing plus padding", () => {
    const ops: DrawOp[] = [
      {
        kind: "rect",
        x: 10,
        y: 20,
        w: 100,
        h: 50,
        fill: null,
        stroke: true,
        strokeWidth: 1,
        rounded: false,
      },
      {
        kind: "line",
        points: [
          [0, 0],
          [10, 90],
        ],
        strokeWidth: 1,
      },
    ];
    expect(renderSvg(ops, style, { padding: 5 })).toContain(
      'width="120" height="100" viewBox="-5 -5 120 100"',
    );
  });

  it("returns an empty image for no ops", () => {
    expect(renderSvg([], style, { padding: 0 })).toContain('width="0" height="0"');
  });

  it("uses the canvas stroke colour, font and font size", () => {
    const svg = svgOf("button: Save", { ...style, stroke: "#e03131", fontFamily: 1, fontSize: 20 });
    expect(svg).toContain('stroke="#e03131"');
    expect(svg).toContain(`font-family="${fontFamilyCss(1)}"`);
    expect(svg).toContain('font-size="20"');
    expect(svg).toContain('fill="#e03131">');
  });

  it("falls back to Excalifont for an unknown font family", () => {
    expect(fontFamilyCss(99)).toBe(fontFamilyCss(5));
  });

  it("fills shapes with their colour and leaves unstroked ones without an outline", () => {
    const ops: DrawOp[] = [
      {
        kind: "rect",
        x: 0,
        y: 0,
        w: 40,
        h: 20,
        fill: "#a5d8ff",
        stroke: false,
        strokeWidth: 1,
        rounded: false,
      },
    ];
    const svg = renderSvg(ops, style);
    expect(svg).toContain('fill="#a5d8ff"');
    expect(svg).not.toContain(`stroke="${style.stroke}"`);
  });

  it("draws rounded rectangles and ellipses", () => {
    const ops: DrawOp[] = [
      {
        kind: "rect",
        x: 0,
        y: 0,
        w: 40,
        h: 20,
        fill: null,
        stroke: true,
        strokeWidth: 2,
        rounded: true,
      },
      { kind: "ellipse", x: 0, y: 30, w: 20, h: 20, fill: "#ffffff", stroke: true, strokeWidth: 1 },
    ];
    const svg = renderSvg(ops, style);
    expect(count(svg, "path")).toBeGreaterThanOrEqual(3);
    expect(svg).toContain('stroke-width="2"');
  });

  it("writes one text element per line, centred in its line box, and escapes it", () => {
    const ops: DrawOp[] = [{ kind: "text", x: 4, y: 10, w: 90, h: 40, text: 'a < "b" & c\n  d' }];
    const svg = renderSvg(ops, style);
    expect(count(svg, "text")).toBe(2);
    expect(svg).toContain('x="4" y="20"');
    expect(svg).toContain('x="4" y="40"');
    expect(svg).toContain("a &lt; &quot;b&quot; &amp; c");
    expect(svg).toContain('xml:space="preserve">  d<');
  });

  it("draws straight lines at roughness 0", () => {
    const ops: DrawOp[] = [
      {
        kind: "line",
        points: [
          [0, 0],
          [50, 0],
        ],
        strokeWidth: 1,
      },
    ];
    const d = /d="([^"]*)"/.exec(renderSvg(ops, { ...style, roughness: 0 }))![1];
    const ys = d.match(/-?[\d.]+/g)!.filter((_, i) => i % 2 === 1);
    expect(ys.every((y) => y === "0")).toBe(true);
  });
});
