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

function fenced(lines: string[]): string | null {
  const open = new RegExp(`^[ \\t]*(\`{3,}|~{3,})[ \\t]*${FENCE_KEYWORD}[ \\t]*$`, "i");
  const at = lines.findIndex((l) => open.test(l));
  if (at < 0) return null;
  const fence = open.exec(lines[at])![1];
  // closed by the same character, at least as many times, and nothing else
  const close = new RegExp(`^[ \\t]*${fence[0] === "`" ? "`" : "~"}{${fence.length},}[ \\t]*$`);
  let end = lines.findIndex((l, i) => i > at && close.test(l));
  if (end < 0) end = lines.length;
  const spec = dedent(lines.slice(at + 1, end));
  return spec.trim() ? spec : null;
}

/**
 * Finds a spec in pasted text: the first ```sketchdown block, or, if plain
 * is true, the whole text when it parses without errors.
 */
export function extractSpec(text: string, options: { plain: boolean }): string | null {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const block = fenced(lines);
  if (block !== null || !options.plain) return block;
  const spec = dedent(lines);
  if (!spec.trim()) return null;
  const { tree, errors } = parse(spec);
  return errors.length || !tree.children.length ? null : spec;
}
