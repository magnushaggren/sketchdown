import { ICON_NAMES, isIcon } from "./icons";
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
  ["icon", "icon"],
  ["input", "input"],
  ["field", "input"],
  ["textbox", "input"],
  ["search", "search"],
  ["password", "password"],
  ["textarea", "textarea"],
  ["heading", "h1"],
  ["h1", "h1"],
  ["h2", "h2"],
  ["subheading", "h2"],
  ["columns", "columns"],
  ["cols", "columns"],
  ["nav", "nav"],
  ["navigation", "nav"],
  ["avatar", "avatar"],
  ["details", "details"],
  ["properties", "details"],
  ["window", "window"],
  ["dialog", "dialog"],
  ["modal", "dialog"],
  ["browser", "browser"],
  ["phone", "phone"],
  ["buttons", "buttons"],
  ["link", "link"],
  ["paragraph", "paragraph"],
  ["p", "paragraph"],
  ["lorem", "paragraph"],
]);
const FRAMES: NodeType[] = ["window", "dialog", "browser", "phone"];
const CONTAINERS = new Set<NodeType>(["root", "box", "tabs", "row", "columns", ...FRAMES]);
const BARE_OK = new Set<NodeType>(["grid", "tabs", "box", "row", "columns", ...FRAMES]); // may appear without a colon
const CONTAINER_NAMES = [...CONTAINERS].filter((t) => t !== "root");
/** Options a component has without writing them. */
const DEFAULT_OPTS: Partial<Record<NodeType, Record<string, number>>> = { buttons: { fill: 1 } };

/** Words that may stand alone in the options brackets; each sets its option to 1. */
export const FLAGS = new Set([
  "fill",
  "disabled",
  "dark",
  "round",
  "segmented",
  "underline",
  "plain",
  "striped",
]);

/**
 * Reads "(k=v, flag, ...)" at the end of a line. Brackets with a k=v pair
 * are always options (pairs that aren't numeric are skipped, as in v2).
 * Brackets without one are options only if every entry is a known flag,
 * so "box: Title (optional)" keeps its text.
 */
export function parseOptions(s: string): { rest: string; opts: Record<string, number> } {
  const opts: Record<string, number> = {};
  const m = s.match(/\(([^()]*)\)\s*$/);
  if (!m || m.index === undefined) return { rest: s.trim(), opts };
  const entries = m[1].split(",").map((t) => t.trim());
  if (!m[1].includes("=") && !entries.every((e) => FLAGS.has(e.toLowerCase()))) {
    return { rest: s.trim(), opts };
  }
  entries.forEach((entry) => {
    if (FLAGS.has(entry.toLowerCase())) {
      opts[entry.toLowerCase()] = 1;
      return;
    }
    const [k, v] = entry.split("=").map((t) => t.trim());
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
      // "keyword: content", or a bare keyword optionally followed by options
      const m = s.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*(?::\s*(.*)|(\([^()]*\)))?$/);
      const type = m ? KEYWORDS.get(m[1].toLowerCase()) : undefined;
      const hasColon = /^[a-zA-Z][a-zA-Z0-9]*\s*:/.test(s);
      const bareOpts = m?.[3] ? parseOptions(m[3]) : null;
      const bareOk = !bareOpts || bareOpts.rest === "";
      if (m && type && (hasColon || (BARE_OK.has(type) && bareOk))) {
        while (stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].node;
        if (!CONTAINERS.has(parent.type)) {
          errors.push({
            line: i + 1,
            message: `"${parent.type}" can't contain other components (only ${CONTAINER_NAMES.slice(0, -1).join(", ")} and ${CONTAINER_NAMES[CONTAINER_NAMES.length - 1]} can)`,
          });
          last = null;
          return;
        }
        const { rest, opts } = bareOpts ?? parseOptions(m[2] || "");
        const node: SpecNode = {
          type,
          text: rest,
          body: [],
          children: [],
          opts: { ...DEFAULT_OPTS[type], ...opts },
          line: i + 1,
        };
        parent.children.push(node);
        if (type === "icon" && !isIcon(rest)) {
          errors.push({
            line: i + 1,
            message: `unknown icon "${rest}"; known icons: ${ICON_NAMES.join(", ")}`,
          });
        }
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
