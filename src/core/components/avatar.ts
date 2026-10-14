import { drawIcon } from "../icons";
import type { Component } from "../types";
import { contentLines } from "./shared";

/** A circle with initials, or a user icon when empty. Twice the line height by default. */
export const avatar: Component = (ctx, node, x, y) => {
  const initials = contentLines(node).join(" ").trim();
  const s = node.opts.w || 2 * ctx.measure(" ").h;
  ctx.ellipse(x, y, s, s, { fill: ctx.theme.colors.fill });
  if (initials) {
    const m = ctx.measure(initials);
    ctx.text(x + (s - m.w) / 2, y + (s - m.h) / 2, initials, m);
  } else {
    const i = s * 0.6;
    drawIcon(ctx, "user", x + (s - i) / 2, y + (s - i) / 2, i);
  }
  return { w: s, h: s };
};
