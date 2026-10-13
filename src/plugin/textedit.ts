// Text operations for the spec editor, as pure functions so they run in tests.
// Each returns one replacement plus the selection to set afterwards.

export interface TextEdit {
  from: number;
  to: number;
  insert: string;
  selStart: number;
  selEnd: number;
}

export const INDENT = "  ";

const lineStartAt = (value: string, pos: number) => value.lastIndexOf("\n", pos - 1) + 1;
const lineEndAt = (value: string, pos: number) => {
  const end = value.indexOf("\n", pos);
  return end < 0 ? value.length : end;
};

/**
 * Tab and Shift-Tab. Tab with a caret inserts one indent at the caret;
 * otherwise every line the selection touches moves by one indent.
 */
export function indentEdit(
  value: string,
  selStart: number,
  selEnd: number,
  outdent: boolean,
): TextEdit {
  if (!outdent && selStart === selEnd) {
    const caret = selStart + INDENT.length;
    return { from: selStart, to: selEnd, insert: INDENT, selStart: caret, selEnd: caret };
  }
  const from = lineStartAt(value, selStart);
  // a selection that ends at the start of a line doesn't include that line
  const last = selEnd > selStart && value[selEnd - 1] === "\n" ? selEnd - 1 : selEnd;
  const to = lineEndAt(value, last);
  const lines = value.slice(from, to).split("\n");
  const moved = lines.map((line) => {
    if (!outdent) return line.trim() ? INDENT + line : line;
    return line.replace(/^(\t| {1,2})/, "");
  });
  const firstDelta = moved[0].length - lines[0].length;
  const insert = moved.join("\n");
  const start = Math.max(from, selStart + firstDelta);
  const end = Math.max(start, selEnd + insert.length - (to - from));
  return { from, to, insert, selStart: start, selEnd: end };
}

/** Enter: the new line starts with the current line's indentation. */
export function newlineEdit(value: string, selStart: number, selEnd: number): TextEdit {
  const before = value.slice(lineStartAt(value, selStart), selStart);
  const insert = "\n" + (before.match(/^[ \t]*/) ?? [""])[0];
  const caret = selStart + insert.length;
  return { from: selStart, to: selEnd, insert, selStart: caret, selEnd: caret };
}

/** Start and end offsets of a 1-based line, without its line break. */
export function lineRange(value: string, line: number): { from: number; to: number } {
  let from = 0;
  for (let i = 1; i < line; i++) {
    const next = value.indexOf("\n", from);
    if (next < 0) return { from: value.length, to: value.length };
    from = next + 1;
  }
  return { from, to: lineEndAt(value, from) };
}

/**
 * Inserts a snippet on lines of its own, indented like the caret's line:
 * in place of that line if it is blank, otherwise below it.
 */
export function snippetEdit(value: string, selStart: number, snippet: string): TextEdit {
  const lineStart = lineStartAt(value, selStart);
  const lineEnd = lineEndAt(value, selStart);
  const line = value.slice(lineStart, lineEnd);
  const indent = (line.match(/^[ \t]*/) ?? [""])[0];
  const text = snippet
    .split("\n")
    .map((l) => indent + l)
    .join("\n");
  const blank = !line.trim();
  const from = blank ? lineStart : lineEnd;
  const insert = blank ? text : "\n" + text;
  const caret = from + insert.length;
  return { from, to: lineEnd, insert, selStart: caret, selEnd: caret };
}
