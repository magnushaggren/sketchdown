import { describe, expect, it } from "vitest";
import { formatError, parse, parseOptions } from "../src/core";
import type { SpecNode } from "../src/core";

// One block per rule in docs/SYNTAX.md.

const kids = (source: string): SpecNode[] => parse(source).tree.children;
const types = (nodes: SpecNode[]) => nodes.map((n) => n.type);

describe("one component per line", () => {
  it("reads keyword: content", () => {
    const { tree, errors } = parse("button: Save");
    expect(errors).toEqual([]);
    expect(tree.type).toBe("root");
    expect(tree.children).toEqual([
      { type: "button", text: "Save", body: [], children: [], opts: {}, line: 1 },
    ]);
  });

  it("ignores keyword case and spaces around the colon", () => {
    expect(kids("BUTTON :   Save  ")[0]).toMatchObject({ type: "button", text: "Save" });
  });

  it("records 1-based line numbers", () => {
    expect(kids("\nbutton: A\n\nbutton: B").map((n) => n.line)).toEqual([2, 4]);
  });

  it("accepts Windows line endings", () => {
    expect(kids("button: A\r\nbutton: B\r\n").map((n) => n.text)).toEqual(["A", "B"]);
  });
});

describe("aliases", () => {
  it.each([
    ["button", "button"],
    ["btn", "button"],
    ["dropdown", "dropdown"],
    ["select", "dropdown"],
    ["combo", "dropdown"],
    ["combobox", "dropdown"],
    ["checkbox", "checkbox"],
    ["check", "checkbox"],
    ["checkboxes", "checkbox"],
    ["text", "text"],
    ["label", "text"],
    ["grid", "grid"],
    ["table", "grid"],
    ["datagrid", "grid"],
    ["tabs", "tabs"],
    ["tab", "tabs"],
    ["box", "box"],
    ["panel", "box"],
    ["group", "box"],
    ["row", "row"],
  ])("%s: is a %s", (keyword, type) => {
    const { tree, errors } = parse(`${keyword}: x`);
    expect(errors).toEqual([]);
    expect(types(tree.children)).toEqual([type]);
  });
});

describe("keywords without a colon", () => {
  it.each(["grid", "tabs", "box", "row", "table", "panel"])("allows a bare %s", (keyword) => {
    const { tree, errors } = parse(keyword);
    expect(errors).toEqual([]);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0].text).toBe("");
  });

  it.each(["button", "dropdown", "checkbox", "text"])("does not allow a bare %s", (keyword) => {
    const { tree, errors } = parse(keyword);
    expect(tree.children).toEqual([]);
    expect(errors).toEqual([{ line: 1, message: `don't understand "${keyword}"` }]);
  });

  it("treats a bare non-container keyword as a continuation line when one is open", () => {
    expect(kids("text: Hello\nbutton")[0].body).toEqual(["button"]);
  });

  it("does not treat object property names as keywords", () => {
    const { tree, errors } = parse("constructor: x\ntoString: y");
    expect(tree.children).toEqual([]);
    expect(errors).toHaveLength(2);
  });
});

describe("indentation nests components", () => {
  it("puts deeper lines inside tabs, box and row", () => {
    const [box] = kids("box: A\n  row:\n    button: B\n    button: C\n  tabs: D\n    text: E");
    expect(types(box.children)).toEqual(["row", "tabs"]);
    expect(types(box.children[0].children)).toEqual(["button", "button"]);
    expect(types(box.children[1].children)).toEqual(["text"]);
  });

  it("returns to an outer container when the indentation decreases", () => {
    const top = kids("box: A\n  row:\n    button: B\n  button: C\nbutton: D");
    expect(types(top)).toEqual(["box", "button"]);
    expect(types(top[0].children)).toEqual(["row", "button"]);
  });

  it("makes lines at the same indentation siblings", () => {
    expect(types(kids("row:\nbutton: A"))).toEqual(["row", "button"]);
  });

  it("counts a tab as 4 spaces", () => {
    const [box] = kids(
      "box: A\n\trow:\n        button: deeper than one tab\n    button: same as one tab",
    );
    expect(types(box.children)).toEqual(["row", "button"]);
    expect(types(box.children[0].children)).toEqual(["button"]);
  });
});

describe("continuation lines", () => {
  it("adds lines without a keyword to the most recent component", () => {
    const [grid] = kids("grid\nName, Role\nAnna, Dev");
    expect(grid.body).toEqual(["Name, Role", "Anna, Dev"]);
  });

  it("trims them and accepts any indentation", () => {
    expect(kids("text: A\n      B  \nC")[0].body).toEqual(["B", "C"]);
  });

  it("attaches them to a nested component, not its container", () => {
    const [box] = kids("box: A\n  checkbox: [x] One\n  [ ] Two");
    expect(box.body).toEqual([]);
    expect(box.children[0].body).toEqual(["[ ] Two"]);
  });

  it("ends the continuation at a blank line", () => {
    const { tree, errors } = parse("text: A\nB\n\nC");
    expect(tree.children[0].body).toEqual(["B"]);
    expect(errors).toEqual([{ line: 4, message: `don't understand "C"` }]);
  });

  it("keeps nesting across a blank line", () => {
    const [box] = kids("box: A\n  button: B\n\n  button: C");
    expect(types(box.children)).toEqual(["button", "button"]);
  });
});

describe("errors", () => {
  it("rejects a component indented under a non-container, with its line number", () => {
    const { tree, errors } = parse("button: A\n  button: B");
    expect(errors).toEqual([
      {
        line: 2,
        message: `"button" can't contain other components (only box, tabs, row, columns, window, dialog, browser and phone can)`,
      },
    ]);
    expect(types(tree.children)).toEqual(["button"]);
  });

  it("formats an error as one line of text, starting with its line number", () => {
    expect(parse("button: A\n\nnonsense").errors.map(formatError)).toEqual([
      `line 3: don't understand "nonsense"`,
    ]);
  });

  it("still returns the rest of the spec", () => {
    const { tree, errors } = parse("nonsense\nbutton: A\n  text: B\nbutton: C");
    expect(errors).toHaveLength(2);
    expect(tree.children.map((n) => n.text)).toEqual(["A", "C"]);
  });

  it("does not attach continuation lines to a rejected component", () => {
    const { tree, errors } = parse("button: A\n  grid\n  x, y");
    expect(errors).toHaveLength(2);
    expect(tree.children[0].body).toEqual([]);
  });

  it("returns an empty tree for an empty spec", () => {
    expect(parse("")).toEqual({
      tree: { type: "root", text: "", body: [], children: [], opts: {} },
      errors: [],
    });
  });
});

describe("options", () => {
  it("reads numeric k=v pairs from brackets at the end of the line", () => {
    expect(kids("tabs: A | B (w=500, h=220)")[0]).toMatchObject({
      text: "A | B",
      opts: { w: 500, h: 220 },
    });
  });

  it("lower-cases keys and accepts decimals and spaces", () => {
    expect(parseOptions("x ( W = 12.5 )")).toEqual({ rest: "x", opts: { w: 12.5 } });
  });

  it("skips pairs that are not numeric", () => {
    expect(parseOptions("x (w=wide, h=10)")).toEqual({ rest: "x", opts: { h: 10 } });
  });

  it("leaves brackets without = in the text", () => {
    expect(kids("box: Title (optional)")[0]).toMatchObject({ text: "Title (optional)", opts: {} });
  });

  it("only looks at the end of the line", () => {
    expect(kids("text: (w=5) later")[0]).toMatchObject({ text: "(w=5) later", opts: {} });
  });

  it("is not read from continuation lines", () => {
    expect(kids("grid\nA, B (w=5)")[0]).toMatchObject({ body: ["A, B (w=5)"], opts: {} });
  });
});

describe("flags", () => {
  it("reads known flag words as options set to 1", () => {
    expect(kids("button: Save (fill, disabled)")[0]).toMatchObject({
      text: "Save",
      opts: { fill: 1, disabled: 1 },
    });
  });

  it.each(["fill", "disabled", "dark", "round", "segmented", "underline", "plain", "striped"])(
    "knows %s",
    (flag) => {
      expect(parseOptions(`x (${flag})`)).toEqual({ rest: "x", opts: { [flag]: 1 } });
    },
  );

  it("ignores case and spaces", () => {
    expect(parseOptions("x ( Fill ,DISABLED )")).toEqual({
      rest: "x",
      opts: { fill: 1, disabled: 1 },
    });
  });

  it("mixes with numeric options", () => {
    expect(parseOptions("x (w=200, fill)")).toEqual({ rest: "x", opts: { w: 200, fill: 1 } });
  });

  it("leaves brackets with any unknown word in the text", () => {
    expect(parseOptions("Title (optional)")).toEqual({ rest: "Title (optional)", opts: {} });
    expect(parseOptions("x (fill, maybe)")).toEqual({ rest: "x (fill, maybe)", opts: {} });
    expect(parseOptions("x ()")).toEqual({ rest: "x ()", opts: {} });
  });

  it("keeps skipping unknown words when the brackets hold a k=v pair, as before", () => {
    expect(parseOptions("x (w=5, wide)")).toEqual({ rest: "x", opts: { w: 5 } });
  });

  it("works on keywords with only options after the colon", () => {
    expect(kids("grid: (plain, striped)\na, b")[0]).toMatchObject({
      text: "",
      opts: { plain: 1, striped: 1 },
    });
  });
});

describe("options on keywords without a colon", () => {
  it("are read on grid, tabs, box and row", () => {
    expect(kids("grid (plain)\na, b")[0]).toMatchObject({
      type: "grid",
      text: "",
      body: ["a, b"],
      opts: { plain: 1 },
    });
    expect(kids("row (fill)")[0]).toMatchObject({ type: "row", opts: { fill: 1 } });
  });

  it("are not accepted on keywords that need a colon", () => {
    expect(parse("button (fill)").errors).toHaveLength(1);
  });

  it("still make a continuation line when the brackets are not options", () => {
    expect(kids("text: A\ngrid (see below)")[0].body).toEqual(["grid (see below)"]);
  });
});

describe("changes from v2", () => {
  it("accepts options after a bare keyword, which v2 reported as an error", () => {
    const { tree, errors } = parse("box (w=50)");
    expect(errors).toEqual([]);
    expect(tree.children[0]).toMatchObject({ type: "box", text: "", opts: { w: 50 } });
  });
});
