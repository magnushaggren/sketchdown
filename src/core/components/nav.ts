import type { Component } from "../types";
import { drawLabel, measureLabel } from "./label";
import type { Label } from "./label";
import { contentLines, splitItems } from "./shared";

const PAD_X = 12,
  PAD_Y = 8;

type Item = { divider: true } | { divider: false; label: Label; active: boolean };

/**
 * A vertical navigation list. Items split on "|" and continuation lines;
 * a leading * marks the active item, and "-" draws a divider.
 */
export const nav: Component = (ctx, node, x, y, slot) => {
  const raw = splitItems(contentLines(node).join("|"), false);
  const items: Item[] = raw.map((t) => {
    if (/^-+$/.test(t)) return { divider: true };
    const active = t.startsWith("*");
    return { divider: false, active, label: measureLabel(ctx, active ? t.slice(1).trim() : t) };
  });
  const lineH = ctx.measure(" ").h;
  const itemH = lineH + 2 * PAD_Y;
  const dividerH = PAD_Y * 2;
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    120,
    ...items.map((it) => (it.divider ? 0 : it.label.w + 2 * PAD_X)),
  );
  const contentH = items.reduce((h, it) => h + (it.divider ? dividerH : itemH), 0);
  const H = Math.max(node.opts.h || 0, slot?.h || 0, contentH);
  const { colors } = ctx.theme;
  if (node.opts.dark) ctx.rect(x, y, W, H, { fill: colors.dark, color: colors.dark });

  let cy = y;
  for (const it of items) {
    if (it.divider) {
      ctx.line([
        [x + PAD_X, cy + dividerH / 2],
        [x + W - PAD_X, cy + dividerH / 2],
      ]);
      cy += dividerH;
      continue;
    }
    if (it.active) {
      // the highlight is light, so its text uses normal ink even on a dark panel
      ctx.rect(x + 4, cy + 2, W - 8, itemH - 4, {
        fill: colors.primary,
        noStroke: true,
        rounded: true,
      });
      const ink = ctx.ink;
      if (ink === colors.onDark) ctx.ink = null;
      drawLabel(ctx, x + PAD_X, cy + (itemH - it.label.h) / 2, it.label);
      ctx.ink = ink;
    } else {
      drawLabel(ctx, x + PAD_X, cy + (itemH - it.label.h) / 2, it.label);
    }
    cy += itemH;
  }
  return { w: W, h: H };
};
