import type { Component } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines } from "./shared";

const ROW_PAD = 6,
  COL_GAP = 16;

/**
 * A detail list: one row per line, "label | value". Labels may hold icons
 * and are drawn in normal ink; values are grey, as secondary text. Values
 * line up in a second column.
 */
export const details: Component = (ctx, node, x, y, slot) => {
  const rows = contentLines(node).map((line) => {
    const at = line.indexOf("|");
    const key = at < 0 ? line : line.slice(0, at);
    const value = at < 0 ? "" : line.slice(at + 1);
    return { key: measureLabel(ctx, key.trim()), value: measureLabel(ctx, value.trim()) };
  });
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
