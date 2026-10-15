import type { Component, SpecNode } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines } from "./shared";

const ROW_PAD = 6,
  COL_GAP = 16;

/** "label | value" lines as pairs. */
function pairs(node: SpecNode): [string, string][] {
  return contentLines(node).map((line) => {
    const at = line.indexOf("|");
    if (at < 0) return [line.trim(), ""];
    return [line.slice(0, at).trim(), line.slice(at + 1).trim()];
  });
}

/**
 * A detail list: one row per line, "label | value". Labels may hold icons
 * and are drawn in normal ink; values are grey, as secondary text. Values
 * line up in a second column.
 */
export const details: Component = (ctx, node, x, y, slot) => {
  if (node.opts.stacked) return stacked(ctx, node, x, y, slot);
  const rows = pairs(node).map(([key, value]) => ({
    key: measureLabel(ctx, key),
    value: measureLabel(ctx, value),
  }));
  const keyW = Math.max(0, ...rows.map((r) => r.key.w));
  const valueW = Math.max(0, ...rows.map((r) => r.value.w));
  const valueX = x + keyW + COL_GAP;
  let cy = y;
  for (const r of rows) {
    const h = Math.max(r.key.h, r.value.h) + 2 * ROW_PAD;
    drawLabel(ctx, x, cy + (h - r.key.h) / 2, r.key);
    if (r.value.w) {
      const ink = ctx.ink;
      if (ink === null) ctx.ink = ctx.theme.colors.muted;
      drawLabel(ctx, valueX, cy + (h - r.value.h) / 2, r.value);
      ctx.ink = ink;
    }
    cy += h;
  }
  const w = valueW ? keyW + COL_GAP + valueW : keyW;
  return { w: Math.max(w, slot?.w || 0), h: cy - y };
};

/** (stacked): each label small and grey above its value, as in detail drawers. */
const stacked: Component = (ctx, node, x, y, slot) => {
  const fontSize = Math.round(ctx.fontSize * 0.75);
  const grey = ctx.ink === null ? { color: ctx.theme.colors.muted } : {};
  let cy = y,
    w = 0;
  for (const [key, value] of pairs(node)) {
    const k = measureLabel(ctx, key, fontSize);
    const v = measureLabel(ctx, value);
    cy += ROW_PAD;
    drawLabel(ctx, x, cy, k, { fontSize, ...grey });
    cy += k.h;
    if (v.w) {
      drawLabel(ctx, x, cy, v);
      cy += v.h;
    }
    cy += ROW_PAD;
    w = Math.max(w, k.w, v.w);
  }
  return { w: Math.max(w, node.opts.w || 0, slot?.w || 0), h: cy - y };
};
