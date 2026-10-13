/*
# Sketchdown – prototype v2

Turn Balsamiq-style text into hand-drawn UI components made of native
Excalidraw shapes.

Components: button, dropdown, checkbox, text, grid
Containers: tabs, box, row   (indent lines under them to nest)

## Three ways to use it
1. Write a spec in a normal Excalidraw text element, select it, run the
   script -> the text is replaced by the component.
2. Select a Sketchdown component, run the script -> edit its text in a popup
   (Ctrl/Cmd+Enter to apply). It is redrawn in the same place.
3. Run with nothing selected -> popup with an example; the result is placed
   in the middle of the view.

## Syntax
button: Cancel
button: *Save                          (* = primary)
dropdown: *Sweden | Norway | Denmark   (* = shown value, default first)
checkbox: [x] Email me | [ ] Text me   (one per item, stacked)
text: Any label

grid
Name, Role, Active                     (first row = header)
Anna, Dev, [x]
*Erik, PM, [ ]                         (* = selected row)

tabs: Overview | *Users | Settings     (* = selected tab)
  ...indented components go inside the tab panel
box: Title (optional)
  ...indented components go inside a frame
row:
  ...indented components are placed side by side

- Indent with spaces or tabs. Anything indented under tabs/box/row is
  inside it; containers can be nested.
- Grid rows go directly under the "grid" line (same indent or deeper).
  Use | instead of , when cells contain commas. Markdown tables work too.
- Optional size: (w=500, h=220) at the end of a line, e.g. tabs or box.
- Lines at the top level are stacked vertically.

```javascript
*/

if (!ea.verifyMinimumPluginVersion || !ea.verifyMinimumPluginVersion("2.0.0")) {
  new Notice("Sketchdown needs Excalidraw plugin 2.0.0 or newer.");
  return;
}

// ===== SKETCHDOWN CORE START =====
const KEY = "sketchdown";
const VERSION = 2;
const FONT_SIZE = 16;
const COLORS = {
  fill: "#e9ecef",      // neutral component fill
  primary: "#a5d8ff",   // primary button
  selected: "#d0ebff",  // selected grid row
  paper: "#ffffff",     // inside of inputs and checkboxes
};
const GAP = { root: 24, stack: 14, row: 12, pad: 16 };
const EXAMPLE = [
  "tabs: Overview | *Users | Settings",
  "  row:",
  "    text: Role",
  "    dropdown: *All roles | Developer | Project manager",
  "    checkbox: [x] Show inactive",
  "  grid",
  "  Name, Role, Active",
  "  Anna, Developer, [x]",
  "  *Erik, Project manager, [ ]",
  "  row:",
  "    button: Cancel",
  "    button: *Save",
].join("\n");

// ---------- parsing: text -> tree ----------
const KEYWORDS = {
  button: "button", btn: "button",
  dropdown: "dropdown", select: "dropdown", combo: "dropdown", combobox: "dropdown",
  checkbox: "checkbox", check: "checkbox", checkboxes: "checkbox",
  text: "text", label: "text",
  grid: "grid", table: "grid", datagrid: "grid",
  tabs: "tabs", tab: "tabs",
  box: "box", panel: "box", group: "box",
  row: "row",
};
const CONTAINERS = new Set(["root", "tabs", "box", "row"]);
const BARE_OK = new Set(["grid", "tabs", "box", "row"]); // may appear without a colon

function parseOptions(s) {
  const opts = {};
  const m = s.match(/\(([^()]*=[^()]*)\)\s*$/);
  if (!m) return { rest: s.trim(), opts };
  m[1].split(",").forEach((kv) => {
    const [k, v] = kv.split("=").map((t) => t.trim());
    if (k && v && !isNaN(Number(v))) opts[k.toLowerCase()] = Number(v);
  });
  return { rest: s.slice(0, m.index).trim(), opts };
}

function splitItems(s, allowComma = true) {
  return (s.includes("|") || !allowComma ? s.split("|") : s.split(","))
    .map((t) => t.trim())
    .filter((t) => t.length);
}

function parse(source) {
  const root = { type: "root", text: "", body: [], children: [], opts: {} };
  const errors = [];
  const stack = [{ node: root, indent: -1 }];
  let last = null; // most recent component, receives continuation lines
  source.replace(/\r/g, "").split("\n").forEach((raw, i) => {
    if (!raw.trim()) { last = null; return; }
    const indent = raw.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;
    const s = raw.trim();
    const m = s.match(/^([a-zA-Z]+)\s*(?::\s*(.*))?$/);
    const type = m ? KEYWORDS[m[1].toLowerCase()] : undefined;
    const hasColon = m && /^[a-zA-Z]+\s*:/.test(s);
    if (type && (hasColon || BARE_OK.has(type))) {
      while (stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack[stack.length - 1].node;
      if (!CONTAINERS.has(parent.type)) {
        errors.push(`line ${i + 1}: "${parent.type}" can't contain other components (only tabs, box, row can)`);
        last = null;
        return;
      }
      const { rest, opts } = parseOptions(m[2] || "");
      const node = { type, text: rest, body: [], children: [], opts, line: i + 1 };
      parent.children.push(node);
      stack.push({ node, indent });
      last = node;
    } else if (last) {
      last.body.push(s);
    } else {
      errors.push(`line ${i + 1}: don't understand "${s}"`);
    }
  });
  return { tree: root, errors };
}

// ---------- drawing helpers (ctx = { ea, st, ids, dry }) ----------
function setText(ctx) {
  Object.assign(ctx.ea.style, {
    fontSize: FONT_SIZE, fontFamily: ctx.st.fontFamily, strokeColor: ctx.st.stroke,
    backgroundColor: "transparent", textAlign: "left", opacity: 100, angle: 0,
  });
}
function measure(ctx, str) {
  setText(ctx);
  const m = ctx.ea.measureText(str && str.length ? str : " ");
  return { w: m.width, h: m.height };
}
function text(ctx, x, y, str) {
  if (ctx.dry || !str) return;
  setText(ctx);
  ctx.ids.push(ctx.ea.addText(x, y, str));
}
function rect(ctx, x, y, w, h, o = {}) {
  if (ctx.dry) return;
  Object.assign(ctx.ea.style, {
    strokeColor: o.noStroke ? "transparent" : ctx.st.stroke,
    backgroundColor: o.fill || "transparent",
    fillStyle: "solid", strokeWidth: o.width || 1, strokeStyle: "solid",
    roughness: ctx.st.roughness, opacity: 100, angle: 0,
    roundness: o.rounded ? { type: 3 } : null,
  });
  ctx.ids.push(ctx.ea.addRect(x, y, w, h));
}
function line(ctx, pts, width = 1) {
  if (ctx.dry) return;
  const clean = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
  Object.assign(ctx.ea.style, {
    strokeColor: ctx.st.stroke, backgroundColor: "transparent", strokeWidth: width,
    strokeStyle: "solid", roughness: ctx.st.roughness, opacity: 100, angle: 0, roundness: null,
  });
  ctx.ids.push(ctx.ea.addLine(clean));
}
const BOX = 14;
function checkMark(ctx, x, y, checked) {
  rect(ctx, x, y, BOX, BOX, { fill: COLORS.paper });
  if (checked) line(ctx, [[x + 3, y + 7], [x + 6, y + 11], [x + 12, y + 2]], 2);
}
function parseCheck(t) {
  const cb = t.match(/^\[( |x|X)?\]\s*(.*)$/);
  if (cb) return { checked: !!cb[1] && cb[1] !== " ", label: cb[2] };
  return null;
}
function starred(items) {
  let sel = items.findIndex((t) => t.startsWith("*") || t.endsWith("*"));
  const labels = items.map((t) => t.replace(/^\*\s*/, "").replace(/\s*\*$/, ""));
  return { sel: sel < 0 ? 0 : sel, labels };
}

// ---------- layout ----------
function draw(ctx, node, x, y) {
  return DRAW[node.type](ctx, node, x, y);
}
function size(ctx, node) {
  const saved = ctx.dry;
  ctx.dry = true;
  const r = draw(ctx, node, 0, 0);
  ctx.dry = saved;
  return r;
}
function stack(ctx, children, x, y, gap) {
  let w = 0, cy = y;
  children.forEach((c, i) => {
    const r = draw(ctx, c, x, cy);
    w = Math.max(w, r.w);
    cy += r.h + (i < children.length - 1 ? gap : 0);
  });
  return { w, h: cy - y };
}

// ---------- containers ----------
function drawRoot(ctx, node, x, y) {
  return stack(ctx, node.children, x, y, GAP.root);
}

function drawRow(ctx, node, x, y) {
  const sizes = node.children.map((c) => size(ctx, c));
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x;
  node.children.forEach((c, i) => {
    draw(ctx, c, cx, y + (H - sizes[i].h) / 2);
    cx += sizes[i].w + (i < node.children.length - 1 ? GAP.row : 0);
  });
  return { w: cx - x, h: H };
}

function drawBox(ctx, node, x, y) {
  const title = node.text;
  const tm = title ? measure(ctx, title) : { w: 0, h: 0 };
  const contentTop = title ? y + tm.h + 2 * 10 + GAP.pad * 0.75 : y + GAP.pad;
  const content = stack(ctx, node.children, x + GAP.pad, contentTop, GAP.stack);
  const W = Math.max(node.opts.w || 0, content.w + 2 * GAP.pad, tm.w + 2 * 12, 120);
  const H = Math.max(
    node.opts.h || 0,
    node.children.length ? contentTop - y + content.h + GAP.pad : (title ? tm.h + 20 + 80 : 100),
  );
  rect(ctx, x, y, W, H, { width: 2 });
  if (title) {
    text(ctx, x + 12, y + 10, title);
    line(ctx, [[x, y + tm.h + 20], [x + W, y + tm.h + 20]], 1);
  }
  return { w: W, h: H };
}

function drawTabs(ctx, node, x, y) {
  const raw = splitItems([node.text, ...node.body].filter(Boolean).join("|"));
  const { sel, labels } = starred(raw.length ? raw : ["Tab 1", "Tab 2", "Tab 3"]);
  const padX = 16, padY = 8, lift = 4;
  const ms = labels.map((l) => measure(ctx, l));
  const tabH = Math.max(...ms.map((m) => m.h)) + 2 * padY;
  const tabs = [];
  let cx = x;
  ms.forEach((m) => { tabs.push({ x: cx, w: m.w + 2 * padX }); cx += m.w + 2 * padX; });
  const top = y + tabH + lift;
  const hasKids = node.children.length > 0;
  const content = stack(ctx, node.children, x + GAP.pad, top + GAP.pad, GAP.stack);
  const W = Math.max(node.opts.w || (hasKids ? 0 : 360), cx - x + 40, content.w + 2 * GAP.pad);
  const panelH = hasKids ? Math.max(node.opts.h || 0, content.h + 2 * GAP.pad) : (node.opts.h || 160);
  const bottom = top + panelH;
  const sL = tabs[sel].x, sR = tabs[sel].x + tabs[sel].w;
  tabs.forEach((t, i) => {
    if (i !== sel) rect(ctx, t.x, y + lift, t.w, tabH, { fill: COLORS.fill });
  });
  line(ctx, [[sR, top], [x + W, top], [x + W, bottom], [x, bottom], [x, top], [sL, top]], 2);
  line(ctx, [[sL, top], [sL, y], [sR, y], [sR, top]], 2);
  tabs.forEach((t, i) => {
    const ty = i === sel ? y : y + lift;
    const th = i === sel ? tabH + lift : tabH;
    text(ctx, t.x + padX, ty + (th - ms[i].h) / 2, labels[i]);
  });
  return { w: W, h: tabH + lift + panelH };
}

// ---------- components ----------
function drawText(ctx, node, x, y) {
  const str = [node.text, ...node.body].filter(Boolean).join("\n") || "Text";
  const m = measure(ctx, str);
  text(ctx, x, y, str);
  return { w: m.w, h: m.h };
}

function drawButton(ctx, node, x, y) {
  let label = (node.text || node.body[0] || "Button").trim();
  let primary = false;
  if (label.startsWith("*")) { primary = true; label = label.slice(1).trim(); }
  const m = measure(ctx, label);
  const w = Math.max(node.opts.w || 0, 80, m.w + 40);
  const h = Math.max(node.opts.h || 0, m.h + 20);
  rect(ctx, x, y, w, h, { fill: primary ? COLORS.primary : COLORS.fill, rounded: true, width: 2 });
  text(ctx, x + (w - m.w) / 2, y + (h - m.h) / 2, label);
  return { w, h };
}

function drawDropdown(ctx, node, x, y) {
  const raw = splitItems([node.text, ...node.body].filter(Boolean).join("|"));
  const { sel, labels } = starred(raw.length ? raw : ["Select…"]);
  const arrowW = 28, padX = 10;
  const textW = Math.max(...labels.map((l) => measure(ctx, l).w));
  const m = measure(ctx, labels[sel]);
  const w = Math.max(node.opts.w || 0, 120, textW + 2 * padX + arrowW);
  const h = m.h + 16;
  rect(ctx, x, y, w, h, { fill: COLORS.paper });
  line(ctx, [[x + w - arrowW, y], [x + w - arrowW, y + h]], 1);
  const ax = x + w - arrowW / 2, ay = y + h / 2;
  line(ctx, [[ax - 5, ay - 2], [ax, ay + 3], [ax + 5, ay - 2]], 2);
  text(ctx, x + padX, y + (h - m.h) / 2, labels[sel]);
  return { w, h };
}

function drawCheckbox(ctx, node, x, y) {
  const items = splitItems([node.text, ...node.body].filter(Boolean).join("|"), false)
    .map((t) => parseCheck(t) || { checked: false, label: t });
  if (!items.length) items.push({ checked: false, label: "Checkbox" });
  const gap = 8, rowGap = 8;
  let w = 0, cy = y;
  items.forEach((it, i) => {
    const m = measure(ctx, it.label);
    const rh = Math.max(m.h, BOX);
    checkMark(ctx, x, cy + (rh - BOX) / 2, it.checked);
    text(ctx, x + BOX + gap, cy + (rh - m.h) / 2, it.label);
    w = Math.max(w, BOX + (it.label ? gap + m.w : 0));
    cy += rh + (i < items.length - 1 ? rowGap : 0);
  });
  return { w, h: cy - y };
}

const NUMERIC = /^[-+]?[$€£]?\s?\d[\d\s.,:]*\s?(%|kr|sek|€|\$|£)?$/i;

function drawGrid(ctx, node, x, y) {
  let rows = [node.text, ...node.body].filter(Boolean);
  if (!rows.length) rows = ["Column A, Column B", "Value, Value"];
  rows = rows.filter((r) => !/^\|?\s*:?-{2,}/.test(r)); // drop markdown |---| lines
  const usePipe = rows.some((r) => r.includes("|"));
  const parsed = rows.map((r) => {
    let s = r.trim();
    let selected = false;
    if (s.startsWith("*") && !s.startsWith("*|") && !s.startsWith("*,")) { selected = true; s = s.slice(1).trim(); }
    if (usePipe) s = s.replace(/^\|/, "").replace(/\|$/, "");
    const cells = (usePipe ? s.split("|") : s.split(",")).map((t) => t.trim()).map((t) => {
      const cb = parseCheck(t);
      if (cb) return { check: true, ...cb };
      return { label: t, numeric: NUMERIC.test(t) };
    });
    return { selected, cells };
  });
  const ncols = Math.max(...parsed.map((r) => r.cells.length));
  parsed.forEach((r) => { while (r.cells.length < ncols) r.cells.push({ label: "" }); });

  const padX = 10, padY = 7, gap = 6;
  let textH = 0;
  const colW = new Array(ncols).fill(0);
  parsed.forEach((r) => r.cells.forEach((cell, i) => {
    const m = measure(ctx, cell.label);
    cell.m = m;
    textH = Math.max(textH, m.h);
    const w = cell.check ? BOX + (cell.label ? gap + m.w : 0) : m.w;
    colW[i] = Math.max(colW[i], w + 2 * padX);
  }));
  const rowH = Math.max(textH, BOX) + 2 * padY;
  const W = colW.reduce((a, b) => a + b, 0);
  const H = rowH * parsed.length;
  if (ctx.dry) return { w: W, h: H };
  const colX = [x];
  colW.forEach((w, i) => colX.push(colX[i] + w));

  rect(ctx, x, y, W, rowH, { fill: COLORS.fill, noStroke: true });
  parsed.forEach((r, ri) => {
    if (r.selected && ri > 0) rect(ctx, x, y + ri * rowH, W, rowH, { fill: COLORS.selected, noStroke: true });
  });
  rect(ctx, x, y, W, H, { width: 2 });
  for (let ri = 1; ri < parsed.length; ri++) {
    line(ctx, [[x, y + ri * rowH], [x + W, y + ri * rowH]], ri === 1 ? 2 : 1);
  }
  for (let ci = 1; ci < ncols; ci++) {
    line(ctx, [[colX[ci], y], [colX[ci], y + H]], 1);
  }
  parsed.forEach((r, ri) => r.cells.forEach((cell, ci) => {
    const cy = y + ri * rowH;
    const inner = colW[ci] - 2 * padX;
    if (cell.check) {
      const contentW = BOX + (cell.label ? gap + cell.m.w : 0);
      const bx = cell.label ? colX[ci] + padX : colX[ci] + padX + (inner - contentW) / 2;
      checkMark(ctx, bx, cy + (rowH - BOX) / 2, cell.checked);
      if (cell.label) text(ctx, bx + BOX + gap, cy + (rowH - cell.m.h) / 2, cell.label);
    } else if (cell.label) {
      const tx = cell.numeric && ri > 0 ? colX[ci] + colW[ci] - padX - cell.m.w : colX[ci] + padX;
      text(ctx, tx, cy + (rowH - cell.m.h) / 2, cell.label);
    }
  }));
  return { w: W, h: H };
}

const DRAW = {
  root: drawRoot, row: drawRow, box: drawBox, tabs: drawTabs,
  text: drawText, button: drawButton, dropdown: drawDropdown, checkbox: drawCheckbox, grid: drawGrid,
};

function build(ea, tree, x, y, st) {
  const ctx = { ea, st, ids: [], dry: false };
  draw(ctx, tree, x, y);
  return ctx.ids;
}
// ===== SKETCHDOWN CORE END =====

// ---------- figure out what we are working on ----------
const api = ea.getExcalidrawAPI();
const app = api.getAppState();
const st = {
  stroke: app.currentItemStrokeColor || "#1e1e1e",
  fontFamily: app.currentItemFontFamily || 1,
  roughness: app.currentItemRoughness ?? 1,
};

const selected = ea.getViewSelectedElements();
const all = ea.getViewElements();
let source = "";
let pos = null;
let toDelete = [];
let askUser = true;

const tagged = selected.find((el) => el.customData?.[KEY]?.source);
const texts = selected.filter((el) => el.type === "text");

if (tagged) {
  // edit an existing component
  const inst = tagged.customData[KEY].instance;
  toDelete = all.filter((el) => el.customData?.[KEY]?.instance === inst);
  source = tagged.customData[KEY].source;
  const bb = ea.getBoundingBox(toDelete);
  pos = { x: bb.topX, y: bb.topY };
} else if (texts.length === 1 && selected.every((el) => el === texts[0] || el.id === texts[0].containerId)) {
  // convert a text element written on the canvas
  const t = texts[0];
  source = t.rawText ?? t.originalText ?? t.text;
  toDelete = selected;
  const bb = ea.getBoundingBox(selected);
  pos = { x: bb.topX, y: bb.topY };
  askUser = false;
}

if (askUser) {
  const value = await utils.inputPrompt({
    header: "Sketchdown – describe the UI (Ctrl/Cmd+Enter to apply)",
    placeholder: EXAMPLE,
    value: source || EXAMPLE,
    lines: 14,
  });
  if (value === undefined || value === null || !value.trim()) return;
  source = value;
}

const { tree, errors } = parse(source);
if (errors.length) {
  new Notice("Sketchdown:\n" + errors.join("\n"), 8000);
}
if (!tree.children.length) return;

if (!pos) {
  const c = ea.getViewCenterPosition() || { x: 0, y: 0 };
  pos = { x: c.x - 200, y: c.y - 150 };
}

// ---------- generate ----------
ea.clear();
const ids = build(ea, tree, pos.x, pos.y, st);
const instance = "sd-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
ids.forEach((id) => ea.addAppendUpdateCustomData(id, { [KEY]: { source, instance, v: VERSION } }));
ea.addToGroup(ids);

if (toDelete.length) ea.deleteViewElements(toDelete);
await ea.addElementsToView(false, true, true);
ea.selectElementsInView(ids);
