import { describe, expect, it } from "vitest";
import { eaMeasure, renderOps } from "../src/adapters/excalidraw";
import { EXAMPLE, KEY, VERSION } from "../src/constants";
import { FONT_SIZE, layout, parse } from "../src/core";
import type { Style } from "../src/core";
import { ALL_SPECS, VALID_SPECS } from "./fixtures/specs";
import { FakeEa } from "./helpers/fakeEa";
import { prototype } from "./helpers/prototype";

// Differential test: the same spec goes through the prototype's own code and
// through the port (parse -> layout -> Excalidraw adapter), each against a
// recording fake of ExcalidrawAutomate. The recorded calls must be identical:
// same elements, same order, same coordinates, same style.

const CANVASES = [
  { stroke: "#1e1e1e", fontFamily: 5, roughness: 1 },
  { stroke: "#e03131", fontFamily: 1, roughness: 0 },
];
const ORIGINS = [
  { x: 0, y: 0 },
  { x: 100, y: 50 },
  { x: -37.5, y: 12.25 },
];

function drawWithPrototype(
  source: string,
  origin: { x: number; y: number },
  canvas: (typeof CANVASES)[0],
) {
  const ea = new FakeEa();
  const ids = prototype.build(ea, prototype.parse(source).tree, origin.x, origin.y, canvas);
  return { calls: ea.calls, ids };
}

function drawWithPort(
  source: string,
  origin: { x: number; y: number },
  canvas: (typeof CANVASES)[0],
) {
  const ea = new FakeEa();
  const style: Style = { ...canvas, fontSize: FONT_SIZE };
  const { ops } = layout(parse(source).tree, origin, { measure: eaMeasure(ea), style });
  const ids = renderOps(ea, ops, style);
  return { calls: ea.calls, ids };
}

describe("constants match the prototype", () => {
  it("has the same example, customData key and version", () => {
    expect(EXAMPLE).toBe(prototype.EXAMPLE);
    expect(KEY).toBe(prototype.KEY);
    expect(VERSION).toBe(prototype.VERSION);
  });
});

describe.each(Object.entries(ALL_SPECS))("parity: %s", (_name, source) => {
  it("parses to the same tree and errors", () => {
    expect(parse(source)).toEqual(prototype.parse(source));
  });

  it("draws the same elements", () => {
    for (const canvas of CANVASES) {
      for (const origin of ORIGINS) {
        const expected = drawWithPrototype(source, origin, canvas);
        const actual = drawWithPort(source, origin, canvas);
        expect(actual.calls).toEqual(expected.calls);
        expect(actual.ids).toEqual(expected.ids);
      }
    }
  });
});

describe("the corpus is not vacuous", () => {
  it.each(Object.entries(VALID_SPECS).filter(([name]) => name !== "empty row"))(
    "%s draws something",
    (_name, source) => {
      expect(drawWithPrototype(source, ORIGINS[0], CANVASES[0]).calls.length).toBeGreaterThan(0);
    },
  );

  it("covers every element kind and style variation the prototype uses", () => {
    const calls = Object.values(ALL_SPECS).flatMap(
      (source) => drawWithPrototype(source, ORIGINS[0], CANVASES[0]).calls,
    );
    const seen = (pred: (c: (typeof calls)[0]) => boolean) => calls.some(pred);
    expect(seen((c) => c.kind === "text")).toBe(true);
    expect(seen((c) => c.kind === "line" && c.style.strokeWidth === 1)).toBe(true);
    expect(seen((c) => c.kind === "line" && c.style.strokeWidth === 2)).toBe(true);
    expect(seen((c) => c.kind === "rect" && c.style.roundness !== null)).toBe(true);
    expect(seen((c) => c.kind === "rect" && c.style.strokeColor === "transparent")).toBe(true);
    for (const fill of ["transparent", "#e9ecef", "#a5d8ff", "#d0ebff", "#ffffff"]) {
      expect(seen((c) => c.kind === "rect" && c.style.backgroundColor === fill)).toBe(true);
    }
  });
});
