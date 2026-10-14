import { parse } from "./parse";

/** The info string of a fenced code block that holds a spec. */
export const FENCE_KEYWORD = "sketchdown";

/** Removes blank lines at both ends and the indentation shared by every non-blank line. */
function dedent(lines: string[]): string {
  let start = 0,
    end = lines.length;
  while (start < end && !lines[start].trim()) start++;
  while (end > start && !lines[end - 1].trim()) end--;
  const body = lines.slice(start, end);
  const indents = body.filter((l) => l.trim()).map((l) => (l.match(/^[ \t]*/) ?? [""])[0]);
  let common = indents[0] ?? "";
  for (const indent of indents) {
    while (!indent.startsWith(common)) common = common.slice(0, -1);
  }
  return body.map((l) => l.slice(Math.min(common.length, l.length))).join("\n");
}

const OPEN = new RegExp(`^[ \\t]*(\`{3,}|~{3,})[ \\t]*${FENCE_KEYWORD}[ \\t]*$`, "i");

/**
 * The first sketchdown block whose opening fence is at or after line from:
 * where its fences are, and its spec. An unclosed block runs to the end.
 */
function nextBlock(
  lines: string[],
  from: number,
): { open: number; close: number; spec: string | null } | null {
  const open = lines.findIndex((l, i) => i >= from && OPEN.test(l));
  if (open < 0) return null;
  const fence = OPEN.exec(lines[open])![1];
  // closed by the same character, at least as many times, and nothing else
  const closeRe = new RegExp(`^[ \\t]*${fence[0] === "`" ? "`" : "~"}{${fence.length},}[ \\t]*$`);
  let close = lines.findIndex((l, i) => i > open && closeRe.test(l));
  if (close < 0) close = lines.length;
  const spec = dedent(lines.slice(open + 1, close));
  return { open, close, spec: spec.trim() ? spec : null };
}

const splitLines = (text: string) => text.replace(/\r\n?/g, "\n").split("\n");

/**
 * Finds a spec in pasted text: the first ```sketchdown block, or, if plain
 * is true, the whole text when it parses without errors.
 */
export function extractSpec(text: string, options: { plain: boolean }): string | null {
  const lines = splitLines(text);
  const block = nextBlock(lines, 0)?.spec ?? null;
  if (block !== null || !options.plain) return block;
  const spec = dedent(lines);
  if (!spec.trim()) return null;
  const { tree, errors } = parse(spec);
  return errors.length || !tree.children.length ? null : spec;
}

/** The spec of the sketchdown block that contains a line (0-based), fences included. */
export function specAtLine(text: string, line: number): string | null {
  const lines = splitLines(text);
  for (let block = nextBlock(lines, 0); block; block = nextBlock(lines, block.close + 1)) {
    if (line < block.open) return null;
    if (line <= block.close) return block.spec;
  }
  return null;
}

/** Wraps a spec in a sketchdown fence, longer than any backtick run inside it. */
export function fenceSpec(spec: string): string {
  const longest = Math.max(0, ...(spec.match(/`+/g) ?? []).map((run) => run.length));
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}${FENCE_KEYWORD}\n${spec.replace(/\s+$/, "")}\n${fence}`;
}
