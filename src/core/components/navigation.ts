import { drawIcon } from "../icons";
import type { Component } from "../types";
import { drawLabel, iconSizeFor, measureLabel } from "./label";
import type { Label } from "./label";
import { contentLines, splitItems } from "./shared";

function asLink(label: Label): Label {
  for (const part of label.parts) if (part.kind === "text" && !part.tone) part.tone = "link";
  return label;
}

/** "Home > Users > *Anna": links with chevrons between; the starred or last item is current. */
export const breadcrumb: Component = (ctx, node, x, y) => {
  const str = contentLines(node).join(" ");
  const raw = str.includes(">") ? str.split(">") : str.split("|");
  const items = raw.map((t) => t.trim()).filter(Boolean);
  if (!items.length) items.push("Home");
  let current = items.findIndex((t) => t.startsWith("*"));
  if (current < 0) current = items.length - 1;
  const labels = items.map((t, i) => {
    const label = measureLabel(ctx, t.replace(/^\*\s*/, ""));
    return i === current ? label : asLink(label);
  });
  const s = iconSizeFor(ctx);
  const gap = Math.round(s * 0.4);
  const H = Math.max(...labels.map((l) => l.h));
  let cx = x;
  labels.forEach((label, i) => {
    if (i > 0) {
      drawIcon(ctx, "chevron-right", cx + gap, y + (H - s) / 2, s);
      cx += 2 * gap + s;
    }
    drawLabel(ctx, cx, y + (H - label.h) / 2, label);
    cx += label.w;
  });
  return { w: cx - x, h: H };
};

const CHEVRONS: Record<string, string> = {
  "<": "chevron-left",
  "«": "chevron-left",
  ">": "chevron-right",
  "»": "chevron-right",
};

/** "< 1 *2 3 … 10 >": a box per page, the starred one filled; … has no box. */
export const pagination: Component = (ctx, node, x, y) => {
  const GAP = 6;
  const tokens = contentLines(node).join(" ").split(/\s+/).filter(Boolean);
  if (!tokens.length) tokens.push("1");
  const B = ctx.measure(" ").h + 12;
  const s = iconSizeFor(ctx);
  const { colors } = ctx.theme;
  let cx = x;
  tokens.forEach((raw, i) => {
    if (i > 0) cx += GAP;
    const active = raw.length > 1 && raw.startsWith("*");
    const t = active ? raw.slice(1) : raw;
    if (t === "…" || t === "...") {
      const m = ctx.measure(t);
      ctx.text(cx, y + (B - m.h) / 2, t, m);
      cx += m.w;
      return;
    }
    const chevron = CHEVRONS[t];
    const m = chevron ? { w: s, h: s } : ctx.measure(t);
    const w = Math.max(B, m.w + 16);
    ctx.rect(cx, y, w, B, { fill: active ? colors.primary : colors.paper });
    if (chevron) drawIcon(ctx, chevron, cx + (w - s) / 2, y + (B - s) / 2, s);
    else ctx.text(cx + (w - m.w) / 2, y + (B - m.h) / 2, t, m);
    cx += w;
  });
  return { w: cx - x, h: B };
};

type MenuItem =
  | { divider: true }
  | {
      divider: false;
      label: Label;
      shortcut: string;
      active: boolean;
      check: boolean | null;
      submenu: boolean;
    };

/** A context or dropdown menu: one item per line, "label | shortcut", "-" for a divider. */
export const menu: Component = (ctx, node, x, y, slot) => {
  const PAD_X = 12,
    PAD_Y = 4,
    DIVIDER = 9;
  const lineH = ctx.measure(" ").h;
  const ITEM = lineH + 12;
  const s = iconSizeFor(ctx);
  const { colors } = ctx.theme;
  const items: MenuItem[] = (contentLines(node).length ? contentLines(node) : ["Item"]).map(
    (line) => {
      if (/^-+$/.test(line.trim())) return { divider: true };
      const [first = "", shortcut = ""] = splitItems(line, false);
      let text = first;
      const active = text.startsWith("*");
      if (active) text = text.slice(1).trim();
      let check: boolean | null = null;
      const cb = text.match(/^\[( |x|X)?\]\s*(.*)$/);
      if (cb) {
        check = !!cb[1] && cb[1] !== " ";
        text = cb[2];
      }
      const submenu = /\s*>$/.test(text);
      if (submenu) text = text.replace(/\s*>$/, "");
      return { divider: false, label: measureLabel(ctx, text), shortcut, active, check, submenu };
    },
  );
  const gutter = items.some((it) => !it.divider && it.check !== null) ? s + 8 : 0;
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    160,
    ...items.map((it) =>
      it.divider
        ? 0
        : 2 * PAD_X +
          gutter +
          it.label.w +
          (it.shortcut ? 32 + ctx.measure(it.shortcut).w : 0) +
          (it.submenu ? 8 + s : 0),
    ),
  );
  const H = 2 * PAD_Y + items.reduce((h, it) => h + (it.divider ? DIVIDER : ITEM), 0);
  ctx.rect(x, y, W, H, { fill: colors.paper, width: 2 });
  let cy = y + PAD_Y;
  for (const it of items) {
    if (it.divider) {
      ctx.line([
        [x + PAD_X, cy + DIVIDER / 2],
        [x + W - PAD_X, cy + DIVIDER / 2],
      ]);
      cy += DIVIDER;
      continue;
    }
    if (it.active) {
      ctx.rect(x + 4, cy + 2, W - 8, ITEM - 4, {
        fill: colors.primary,
        noStroke: true,
        rounded: true,
      });
    }
    if (it.check) drawIcon(ctx, "check", x + PAD_X, cy + (ITEM - s) / 2, s);
    drawLabel(ctx, x + PAD_X + gutter, cy + (ITEM - it.label.h) / 2, it.label);
    if (it.shortcut) {
      const m = ctx.measure(it.shortcut);
      ctx.text(x + W - PAD_X - m.w, cy + (ITEM - m.h) / 2, it.shortcut, m, {
        ...(ctx.ink === colors.disabled ? {} : { color: colors.muted }),
      });
    }
    if (it.submenu) drawIcon(ctx, "chevron-right", x + W - PAD_X - s, cy + (ITEM - s) / 2, s);
    cy += ITEM;
  }
  return { w: W, h: H };
};

/**
 * A tree from indented lines. Indentation is ranked, so any consistent
 * step works. "+ name" is a closed folder, "- name" an open one, * selects.
 */
export const tree: Component = (ctx, node, x, y, slot) => {
  const STEP = 20,
    PAD_Y = 4;
  const ROW = ctx.measure(" ").h + 2 * PAD_Y;
  const s = iconSizeFor(ctx);
  const TEXT = s + 4;
  const indentOf = (l: string) => l.length - l.trimStart().length;
  const body = node.body.filter((l) => l.trim());
  const indents = [...new Set(body.map(indentOf))].sort((a, b) => a - b);
  const base = node.text ? 1 : 0;
  const lines = [
    ...(node.text ? [{ level: 0, raw: node.text }] : []),
    ...body.map((l) => ({ level: base + indents.indexOf(indentOf(l)), raw: l.trim() })),
  ];
  if (!lines.length) lines.push({ level: 0, raw: "Item" });
  const rows = lines.map(({ level, raw }) => {
    let t = raw;
    let selected = false;
    const star = () => {
      if (t.startsWith("*")) {
        selected = true;
        t = t.slice(1).trim();
      }
    };
    star();
    const m = t.match(/^([+-])\s+(.*)$/);
    const folder = m ? (m[1] === "+" ? "chevron-right" : "chevron-down") : null;
    if (m) t = m[2];
    star();
    return { level, folder, selected, label: measureLabel(ctx, t) };
  });
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    ...rows.map((r) => r.level * STEP + TEXT + r.label.w),
  );
  const { colors } = ctx.theme;
  rows.forEach((r, i) => {
    const ry = y + i * ROW;
    if (r.selected) ctx.rect(x, ry, W, ROW, { fill: colors.selected, noStroke: true });
    const rx = x + r.level * STEP;
    if (r.folder) drawIcon(ctx, r.folder, rx, ry + (ROW - s) / 2, s);
    drawLabel(ctx, rx + TEXT, ry + (ROW - r.label.h) / 2, r.label);
  });
  return { w: W, h: rows.length * ROW };
};
