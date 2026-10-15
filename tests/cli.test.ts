import { describe, expect, it } from "vitest";
import { monoMeasure, parseArgs, report, sketch } from "../src/cli/sketch";

describe("sketch", () => {
  it("renders a spec to SVG and reports its size", () => {
    const result = sketch("button: *Save");
    expect(result.errors).toEqual([]);
    expect(result.svg).toMatch(/^<svg /);
    expect(result.svg).toContain(">Save</text>");
    expect(result.size.w).toBeGreaterThan(0);
    expect(result.size.h).toBeGreaterThan(0);
  });

  it("uses the spec in a sketchdown fence when there is one", () => {
    const result = sketch("Some notes\n```sketchdown\nbutton: Fenced\n```\nmore notes");
    expect(result.errors).toEqual([]);
    expect(result.svg).toContain(">Fenced</text>");
  });

  it("reports parse errors with line numbers and still draws the rest", () => {
    const result = sketch("button: Ok\n  text: nested under a button");
    expect(result.errors).toEqual([expect.objectContaining({ line: 2 })]);
    expect(result.svg).toContain(">Ok</text>");
  });

  it("lists the placeholders with their lines and sizes", () => {
    const result = sketch("text: Hi\nrow:\n  placeholder: 240x40 Date picker\n  placeholder: Map");
    expect(result.placeholders).toEqual([
      { line: 3, name: "Date picker", w: 240, h: 40 },
      { line: 4, name: "Map", w: 120, h: 40 },
    ]);
  });

  it("puts a white background behind the drawing", () => {
    expect(sketch("text: A").svg).toMatch(/^<svg style="background:#ffffff" /);
  });
});

describe("monoMeasure", () => {
  it("is fixed-width and scales with the font size", () => {
    const small = monoMeasure("abcd", { fontSize: 16, fontFamily: 3 });
    const large = monoMeasure("abcd", { fontSize: 32, fontFamily: 3 });
    expect(large.w).toBe(2 * small.w);
    expect(large.h).toBe(2 * small.h);
    expect(monoMeasure("ab\nabcd", { fontSize: 16, fontFamily: 3 })).toEqual({
      w: small.w,
      h: 2 * small.h,
    });
  });
});

describe("parseArgs", () => {
  it("takes an input and any number of .svg and .png outputs", () => {
    expect(parseArgs(["spec.txt", "a.svg", "b.png"])).toEqual({
      input: "spec.txt",
      svg: ["a.svg"],
      png: ["b.png"],
    });
  });

  it("writes an SVG next to the input when no output is given", () => {
    expect(parseArgs(["dir/spec.txt"])).toEqual({
      input: "dir/spec.txt",
      svg: ["dir/spec.svg"],
      png: [],
    });
  });

  it("reads stdin from -", () => {
    expect(parseArgs(["-", "out.png"])).toEqual({ input: "-", svg: [], png: ["out.png"] });
  });

  it("rejects a missing input and unknown output types", () => {
    expect(() => parseArgs([])).toThrow(/usage/i);
    expect(() => parseArgs(["spec.txt", "out.jpg"])).toThrow(/\.svg or \.png/);
  });
});

describe("report", () => {
  it("summarises size, errors and placeholders", () => {
    const text = report(sketch("button: Ok\n  text: bad\nplaceholder: 200x50 Chart"), ["out.svg"]);
    expect(text).toMatch(/^size: \d+x\d+$/m);
    expect(text).toMatch(/^error: line 2: /m);
    expect(text).toContain("placeholder: line 3: Chart (200x50)");
    expect(text).toContain("wrote out.svg");
  });

  it("says when there are no errors", () => {
    expect(report(sketch("text: A"), [])).toContain("errors: none");
  });
});

describe("unknown icons", () => {
  it("are listed as warnings with their lines", () => {
    const result = sketch("button: {refresh} Reload\ntext: {home} ok\ngrid\n  a, {nope}");
    expect(result.warnings).toEqual([
      { line: 1, message: "{refresh} is not an icon, so it is drawn as text" },
      { line: 4, message: "{nope} is not an icon, so it is drawn as text" },
    ]);
  });

  it("count lines inside a fence from the fence", () => {
    expect(sketch("intro\n```sketchdown\ntext: {nope}\n```").warnings[0].line).toBe(1);
  });

  it("are reported", () => {
    expect(report(sketch("text: {nope}"), [])).toContain(
      "warning: line 1: {nope} is not an icon, so it is drawn as text",
    );
  });
});
