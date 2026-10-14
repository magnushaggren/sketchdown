import type { Component } from "../types";

export const button: Component = (ctx, node, x, y, slot) => {
  let label = (node.text || node.body[0] || "Button").trim();
  let primary = false;
  if (label.startsWith("*")) {
    primary = true;
    label = label.slice(1).trim();
  }
  const m = ctx.measure(label);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 80, m.w + 40);
  const h = Math.max(node.opts.h || 0, m.h + 20);
  const { colors } = ctx.theme;
  ctx.rect(x, y, w, h, { fill: primary ? colors.primary : colors.fill, rounded: true, width: 2 });
  ctx.text(x + (w - m.w) / 2, y + (h - m.h) / 2, label, m);
  return { w, h };
};
