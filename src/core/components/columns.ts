import type { Component, Slot } from "../types";

/**
 * Panels side by side, all as tall as the tallest (or as (h=...)). With a
 * known width, (fill) children share what the others leave over. No gap by
 * default, so neighbouring panels touch, as in an app shell.
 */
export const columns: Component = (ctx, node, x, y, slot) => {
  const gap = node.opts.gap ?? 0;
  const kids = node.children;
  let sizes = kids.map((c) => ctx.size(c));
  const widths: (number | undefined)[] = kids.map(() => undefined);
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const fills = kids.filter((c) => c.opts.fill).length;
  if (target && fills) {
    const used = sizes.reduce((sum, s, i) => sum + (kids[i].opts.fill ? 0 : s.w), 0);
    const share = (target - used - gap * (kids.length - 1)) / fills;
    kids.forEach((c, i) => (widths[i] = c.opts.fill ? share : undefined));
    sizes = kids.map((c, i) => (widths[i] ? ctx.size(c, { w: widths[i] }) : sizes[i]));
  }
  const H = Math.max(node.opts.h || 0, slot?.h || 0, ...sizes.map((s) => s.h));
  const slots: Slot[] = kids.map((_, i) => (widths[i] ? { w: widths[i], h: H } : { h: H }));
  let cx = x;
  kids.forEach((c, i) => {
    const r = ctx.draw(c, cx, y, slots[i]);
    cx += r.w + (i < kids.length - 1 ? gap : 0);
  });
  return { w: cx - x, h: H };
};
