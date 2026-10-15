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
  ["radio", "radio"],
  ["radios", "radio"],
  ["option", "radio"],
  ["toggle", "toggle"],
  ["switch", "toggle"],
  ["slider", "slider"],
  ["range", "slider"],
  ["alert", "alert"],
  ["message", "alert"],
  ["notice", "alert"],
  ["progress", "progress"],
  ["tooltip", "tooltip"],
  ["hint", "tooltip"],
  ["image", "image"],
  ["img", "image"],
  ["picture", "image"],
  ["placeholder", "placeholder"],
  ["form", "form"],
  ["section", "section"],
  ["breadcrumb", "breadcrumb"],
  ["breadcrumbs", "breadcrumb"],
  ["crumbs", "breadcrumb"],
  ["pagination", "pagination"],
  ["pager", "pagination"],
  ["pages", "pagination"],
  ["menu", "menu"],
  ["contextmenu", "menu"],
  ["tree", "tree"],
  ["spin", "spin"],
  ["number", "spin"],
  ["stepper", "spin"],
]);
const FRAMES: NodeType[] = ["window", "dialog", "browser", "phone"];
const CONTAINERS = new Set<NodeType>([
  "root",
  "box",
  "form",
  "section",
  "tabs",
  "row",
  "columns",
  ...FRAMES,
]);
const BARE_OK = new Set<NodeType>([
  "grid",
  "tabs",
  "box",
  "form",
  "section",
  "row",
  "columns",
  ...FRAMES,
]); // may appear without a colon
const CONTAINER_NAMES = [...CONTAINERS].filter((t) => t !== "root");
// containers that take no continuation lines (tabs takes extra tab names)
const NO_BODY = new Set<NodeType>([...CONTAINERS].filter((t) => t !== "tabs"));

/** The error for a line that is neither a component nor a continuation line. */
function notUnderstood(line: string, keyword: string | undefined, type: NodeType | undefined) {
  const message = `don't understand "${line}"`;
  if (!keyword || !type || BARE_OK.has(type)) return message;
  const rest = line.slice(keyword.length).trim();
  return `${message}: "${keyword}" needs a colon, as in "${keyword}:${rest ? " " + rest : ""}"`;
}
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
  "floating",
  "required",
  "invalid",
  "collapsible",
  "collapsed",
  "top",
  "empty",
  "stacked",
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

/** Options of a field's component that also apply to the field itself. */
const FIELD_OPTS = ["fill", "disabled", "floating", "required"];

/**
 * Splits "Label | keyword: content" at the first | that is followed by a
 * keyword and a colon. Without one, "field:" stays an alias of input.
 */
function splitField(content: string): { label: string; line: string } | null {
  for (let i = content.indexOf("|"); i >= 0; i = content.indexOf("|", i + 1)) {
    const line = content.slice(i + 1).trim();
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*:/);
    if (m && KEYWORDS.has(m[1].toLowerCase())) return { label: content.slice(0, i).trim(), line };
  }
  return null;
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
        const component = (type: NodeType, content: string): SpecNode => {
          const { rest, opts } = parseOptions(content);
          if (type === "icon" && !isIcon(rest)) {
            errors.push({
              line: i + 1,
              message: `unknown icon "${rest}"; known icons: ${ICON_NAMES.join(", ")}`,
            });
          }
          const node = { type, text: rest, body: [], children: [], line: i + 1 };
          return { ...node, opts: { ...DEFAULT_OPTS[type], ...opts } };
        };
        const labelled = m[1].toLowerCase() === "field" && hasColon ? splitField(m[2]) : null;
        let node: SpecNode;
        if (labelled) {
          // "field: Label | input: Anna": a label before one component
          const im = labelled.line.match(/^([a-zA-Z][a-zA-Z0-9]*)\s*:\s*(.*)$/)!;
          let innerType = KEYWORDS.get(im[1].toLowerCase())!;
          let content = im[2];
          if (CONTAINERS.has(innerType)) {
            errors.push({
              line: i + 1,
              message: `a field holds one component like input or dropdown, not "${im[1]}"`,
            });
            innerType = "input";
            content = "";
          }
          const inner = component(innerType, content);
          const opts: Record<string, number> = {};
          for (const k of FIELD_OPTS) if (inner.opts[k]) opts[k] = inner.opts[k];
          node = {
            type: "field",
            text: labelled.label,
            body: [],
            children: [inner],
            opts,
            line: i + 1,
          };
        } else if (bareOpts) {
          node = { ...component(type, ""), opts: { ...DEFAULT_OPTS[type], ...bareOpts.opts } };
        } else {
          node = component(type, m[2] || "");
        }
        parent.children.push(node);
        stack.push({ node, indent });
        // continuation lines belong to a field's component
        last = node.type === "field" ? node.children[0] : node;
      } else if (last && !NO_BODY.has(last.type)) {
        // a tree's lines keep their indentation, which gives their level
        last.body.push(last.type === "tree" ? raw.replace(/\t/g, "    ").trimEnd() : s);
      } else {
        errors.push({ line: i + 1, message: notUnderstood(s, m?.[1], type) });
      }
    });
  return { tree: root, errors };
}
