import { describe, expect, it } from "vitest";
import { indentEdit, lineRange, newlineEdit } from "../src/plugin/textedit";
import type { TextEdit } from "../src/plugin/textedit";

// "|" marks the selection: one for a caret, two for a range.
function run(marked: string, edit: (value: string, start: number, end: number) => TextEdit) {
  const start = marked.indexOf("|");
  const second = marked.indexOf("|", start + 1);
  const value = marked.replace(/\|/g, "");
  const end = second < 0 ? start : second - 1;
  const e = edit(value, start, end);
  const out = value.slice(0, e.from) + e.insert + value.slice(e.to);
  return e.selStart === e.selEnd
    ? out.slice(0, e.selStart) + "|" + out.slice(e.selStart)
    : out.slice(0, e.selStart) + "|" + out.slice(e.selStart, e.selEnd) + "|" + out.slice(e.selEnd);
}
const tab = (marked: string) => run(marked, (v, s, e) => indentEdit(v, s, e, false));
const shiftTab = (marked: string) => run(marked, (v, s, e) => indentEdit(v, s, e, true));
const enter = (marked: string) => run(marked, newlineEdit);

describe("Tab", () => {
  it("inserts two spaces at the caret", () => {
    expect(tab("|button: A")).toBe("  |button: A");
    expect(tab("row:\n|")).toBe("row:\n  |");
  });

  it("indents every line the selection touches and keeps them selected", () => {
    expect(tab("row:\nbut|ton: A\nbutton|: B\ntext: C")).toBe(
      "row:\n  but|ton: A\n  button|: B\ntext: C",
    );
  });

  it("leaves a line alone when the selection ends at its start", () => {
    expect(tab("|button: A\n|button: B")).toBe("  |button: A\n|button: B");
  });

  it("does not add spaces to blank lines", () => {
    expect(tab("|a\n\nb|")).toBe("  |a\n\n  b|");
  });
});

describe("Shift-Tab", () => {
  it("removes one indent from the caret's line", () => {
    expect(shiftTab("row:\n    button|: A")).toBe("row:\n  button|: A");
  });

  it("removes a single space or a tab when that is all there is", () => {
    expect(shiftTab(" a|")).toBe("a|");
    expect(shiftTab("\ta|")).toBe("a|");
  });

  it("does nothing to a line without indentation", () => {
    expect(shiftTab("a|b")).toBe("a|b");
  });

  it("keeps the caret on its line when it was inside the indentation", () => {
    expect(shiftTab("x\n |   a")).toBe("x\n|  a");
  });

  it("outdents every selected line", () => {
    expect(shiftTab("  |a\n    b\nc|")).toBe("|a\n  b\nc|");
  });
});

describe("Enter", () => {
  it("continues the current line's indentation", () => {
    expect(enter("row:\n  button: A|")).toBe("row:\n  button: A\n  |");
    expect(enter("button: A|")).toBe("button: A\n|");
  });

  it("only copies indentation that is before the caret", () => {
    expect(enter(" |   a")).toBe(" \n |   a");
  });

  it("replaces the selection", () => {
    expect(enter("  a|bc|d")).toBe("  a\n  |d");
  });
});

describe("lineRange", () => {
  const value = "one\n\nthree";
  it("finds a line by its 1-based number", () => {
    expect(lineRange(value, 1)).toEqual({ from: 0, to: 3 });
    expect(lineRange(value, 2)).toEqual({ from: 4, to: 4 });
    expect(lineRange(value, 3)).toEqual({ from: 5, to: 10 });
  });

  it("gives the end of the text for a line past the end", () => {
    expect(lineRange(value, 9)).toEqual({ from: 10, to: 10 });
  });
});
