import type { NodeType, ParseError, ParseResult, SpecNode } from "./types";

const KEYWORDS = new Map<string, NodeType>([
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
]);
const CONTAINERS = new Set<NodeType>(["root", "tabs", "box", "row"]);
const BARE_OK = new Set<NodeType>(["grid", "tabs", "box", "row"]); // may appear without a colon

export function parseOptions(s: string): { rest: string; opts: Record<string, number> } {
  const opts: Record<string, number> = {};
  const m = s.match(/\(([^()]*=[^()]*)\)\s*$/);
  if (!m || m.index === undefined) return { rest: s.trim(), opts };
  m[1].split(",").forEach((kv) => {
    const [k, v] = kv.split("=").map((t) => t.trim());
    if (k && v && !isNaN(Number(v))) opts[k.toLowerCase()] = Number(v);
  });
  return { rest: s.slice(0, m.index).trim(), opts };
}

/** The one-line form shown in notices: `line 3: don't understand "x"`. */
export function formatError(e: ParseError): string {
  return `line ${e.line}: ${e.message}`;
}

export function parse(source: string): ParseResult {
  const root: SpecNode = { type: "root", text: "", body: [], children: [], opts: {} };
  const errors: ParseError[] = [];
  const stack: { node: SpecNode; indent: number }[] = [{ node: root, indent: -1 }];
  let last: SpecNode | null = null; // most recent component, receives continuation lines
  source
    .replace(/\r/g, "")
    .split("\n")
    .forEach((raw, i) => {
      if (!raw.trim()) {
        last = null;
        return;
      }
      const indent = (raw.match(/^[ \t]*/) ?? [""])[0].replace(/\t/g, "    ").length;
      const s = raw.trim();
      const m = s.match(/^([a-zA-Z]+)\s*(?::\s*(.*))?$/);
      const type = m ? KEYWORDS.get(m[1].toLowerCase()) : undefined;
      const hasColon = /^[a-zA-Z]+\s*:/.test(s);
      if (m && type && (hasColon || BARE_OK.has(type))) {
        while (stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].node;
        if (!CONTAINERS.has(parent.type)) {
          errors.push({
            line: i + 1,
            message: `"${parent.type}" can't contain other components (only tabs, box, row can)`,
          });
          last = null;
          return;
        }
        const { rest, opts } = parseOptions(m[2] || "");
        const node: SpecNode = { type, text: rest, body: [], children: [], opts, line: i + 1 };
        parent.children.push(node);
        stack.push({ node, indent });
        last = node;
      } else if (last) {
        last.body.push(s);
      } else {
        errors.push({ line: i + 1, message: `don't understand "${s}"` });
      }
    });
  return { tree: root, errors };
}
