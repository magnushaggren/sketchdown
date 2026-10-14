import type { Component } from "../types";
import { drawLabel, measureLabel } from "./label";

export const button: Component = (ctx, node, x, y, slot) => {
  let text = (node.text || node.body[0] || "Button").trim();
  let primary = false;
  if (text.startsWith("*")) {
    primary = true;
    text = text.slice(1).trim();
  }
  const label = measureLabel(ctx, text);
  const h = Math.max(node.opts.h || 0, label.h + 20);
  // an icon-only button is square, or a circle when (round)
  const w = label.iconOnly
    ? Math.max(node.opts.w || 0, slot?.w || 0, h)
    : Math.max(node.opts.w || 0, slot?.w || 0, 80, label.w + 40);
  const { colors } = ctx.theme;
  const fill = primary ? colors.primary : colors.fill;
  if (label.iconOnly && node.opts.round) ctx.ellipse(x, y, w, h, { fill, width: 2 });
  else ctx.rect(x, y, w, h, { fill, rounded: true, width: 2 });
  drawLabel(ctx, x + (w - label.w) / 2, y + (h - label.h) / 2, label);
  return { w, h };
};
