import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, FONT_SIZE, layout, parse } from "../src/core";
import type { DrawOp, RectOp, SpecNode, Style, TextOp } from "../src/core";
import { CHAR_W, LINE_H, fakeMeasure } from "./helpers/fakeMeasure";

const style: Style = { stroke: "#1e1e1e", fontFamily: 5, roughness: 1, fontSize: FONT_SIZE };
const draw = (source: string) =>
  layout(parse(source).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
const rects = (ops: DrawOp[]) => ops.filter((o): o is RectOp => o.kind === "rect");
const texts = (ops: DrawOp[]) => ops.filter((o): o is TextOp => o.kind === "text");
const text = (ops: DrawOp[], s: string) => texts(ops).find((t) => t.text === s)!;
const fields = (ops: DrawOp[]) => rects(ops).filter((r) => r.fill === colors.paper && r.stroke);
const kids = (source: string): SpecNode[] => parse(source).tree.children;
const { pad, row: GAP } = DEFAULT_THEME.gap;
const { colors } = DEFAULT_THEME;

describe("field: parsing", () => {
  it("splits a label from the component after the first | before a keyword", () => {
    const [field] = kids("field: Customer | search: Search...");
    expect(field).toMatchObject({ type: "field", text: "Customer" });
    expect(field.children).toEqual([
      expect.objectContaining({ type: "search", text: "Search..." }),
    ]);
  });

  it("leaves later | to the component", () => {
    const [field] = kids("field: AD Domain | dropdown: *Sweden | Norway");
    expect(field.text).toBe("AD Domain");
    expect(field.children[0]).toMatchObject({ type: "dropdown", text: "*Sweden | Norway" });
  });

  it("accepts aliases for the component", () => {
    expect(kids("field: Country | select: A")[0].children[0].type).toBe("dropdown");
  });

  it("stays an alias of input without a | before a keyword, as before M7", () => {
    expect(kids("field: Anna")[0]).toMatchObject({ type: "input", text: "Anna" });
    expect(kids("field: Name | Anna")[0]).toMatchObject({ type: "input", text: "Name | Anna" });
    expect(kids("field: a | nonsense: b")[0].type).toBe("input");
  });

  it("takes a component with no content", () => {
    expect(kids("field: Name | input:")[0].children[0]).toMatchObject({ type: "input", text: "" });
  });

  it("gives the options at the end to the component, and fill, disabled and floating to the field too", () => {
    const [field] = kids("field: Name | input: Anna (w=300, fill, disabled)");
    expect(field.children[0].opts).toEqual({ w: 300, fill: 1, disabled: 1 });
    expect(field.opts).toEqual({ fill: 1, disabled: 1 });
    expect(kids("field: Type | dropdown: A (floating)")[0].opts).toEqual({ floating: 1 });
  });

  it("gives continuation lines to the component", () => {
    expect(kids("field: Notes | textarea: one\ntwo")[0].children[0].body).toEqual(["two"]);
  });

  it("records the line on both", () => {
    const [, field] = kids("text: A\nfield: Name | input: x");
    expect(field.line).toBe(2);
    expect(field.children[0].line).toBe(2);
  });

  it("rejects a container as the component", () => {
    const { tree, errors } = parse("field: Group | box: X");
    expect(errors).toEqual([
      { line: 1, message: `a field holds one component like input or dropdown, not "box"` },
    ]);
    expect(tree.children[0].children[0]).toMatchObject({ type: "input", text: "" });
  });

  it("can't hold indented components", () => {
    expect(parse("field: A | input:\n  button: B").errors).toHaveLength(1);
  });
});

describe("form: parsing", () => {
  it("is a container, also without a colon, with options", () => {
    const [form] = kids("form: Domain (label=140)\n  field: A | input:\n  field: B | input:");
    expect(form).toMatchObject({ type: "form", text: "Domain", opts: { label: 140 } });
    expect(form.children.map((c) => c.type)).toEqual(["field", "field"]);
    expect(parse("form\n  field: A").errors).toEqual([]);
  });
});

describe("field: layout", () => {
  it("puts the label before the component, centred on it", () => {
    const { ops, size } = draw("field: Name | input: Anna");
    const label = text(ops, "Name");
    const box = fields(ops)[0];
    expect(label.x).toBe(0);
    expect(box.x).toBe(4 * CHAR_W + GAP);
    expect(label.y + label.h / 2).toBe(box.y + box.h / 2);
    expect(size).toEqual({ w: box.x + box.w, h: box.h });
  });

  it("keeps the label near the top of a tall component", () => {
    const { ops } = draw("field: Notes | textarea: a");
    expect(text(ops, "Notes").y).toBeLessThan(20);
  });

  it("stretches the component when the field is (fill)", () => {
    const { ops } = draw("box (w=500)\n  field: Name | input: (fill)");
    const input = fields(ops).pop()!;
    expect(input.x + input.w).toBe(500 - pad);
  });

  it("is grey with (disabled), label included", () => {
    const { ops } = draw("field: Name | input: Anna (disabled)");
    expect(text(ops, "Name").color).toBe(colors.disabled);
  });

  it("floats the label small on the top border with (floating)", () => {
    const { ops, size } = draw("field: Type | dropdown: Virtual (floating)");
    const label = text(ops, "Type");
    const outline = fields(ops)[0];
    expect(label.fontSize).toBeLessThan(FONT_SIZE);
    expect(label.y + label.h / 2).toBe(outline.y);
    expect(label.x).toBeGreaterThan(outline.x);
    expect(outline.x).toBe(0);
    // a white patch under the label breaks the border
    expect(rects(ops).some((r) => !r.stroke && r.fill === colors.paper)).toBe(true);
    expect(size.h).toBe(outline.h + label.h / 2);
  });
});

describe("form: layout", () => {
  it("lines up its fields after the longest label", () => {
    const { ops } = draw("form\n  field: ID | input: 1\n  field: Description | input: 2");
    const [a, b] = fields(ops);
    expect(a.x).toBe(b.x);
    expect(a.x).toBe(pad + 11 * CHAR_W + GAP);
  });

  it("uses (label=...) as the label column", () => {
    const { ops } = draw("form: (label=140)\n  field: ID | input: 1");
    const input = fields(ops)[0];
    expect(input.x).toBe(pad + 140 + GAP);
  });

  it("gives fields side by side in a row a label column each", () => {
    const { ops } = draw(
      "form\n  row:\n    field: A | input: 1\n    field: Version | input: 2\n  row:\n    field: Long label | input: 3\n    field: B | input: 4",
    );
    const inputs = fields(ops);
    expect(inputs[0].x).toBe(inputs[2].x);
    const label2 = text(ops, "Version"),
      label4 = text(ops, "B");
    expect(inputs[1].x - label2.x).toBe(inputs[3].x - label4.x);
  });

  it("draws like a box: a frame, and a title bar when it has a title", () => {
    const { ops } = draw("form: Domain\n  field: A");
    expect(rects(ops).some((r) => r.x === 0 && r.y === 0 && r.strokeWidth === 2)).toBe(true);
    expect(text(ops, "Domain").y).toBeLessThan(LINE_H);
  });

  it("does not align fields in a nested box", () => {
    const { ops } = draw("form\n  field: Description | input: 1\n  box\n    field: A | input: 2");
    const inputs = fields(ops);
    expect(inputs[1].x).not.toBe(inputs[0].x);
  });

  it("leaves floating fields out of the label column", () => {
    const { ops } = draw(
      "form\n  field: ID | input: 1\n  field: A very long label | input: 2 (floating)",
    );
    const inputs = fields(ops);
    expect(inputs[0].x).toBe(pad + 2 * CHAR_W + GAP);
  });
});
