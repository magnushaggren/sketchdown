import type { Component, Slot } from "../types";

export const row: Component = (ctx, node, x, y, slot) => {
  const gap = ctx.theme.gap.row;
  const kids = node.children;
  let sizes = kids.map((c) => ctx.size(c));
  let slots: (Slot | undefined)[] = kids.map(() => undefined);
  // With a known width, (fill) children share what the others leave over.
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const fills = kids.filter((c) => c.opts.fill).length;
  if (target && fills) {
    const used = sizes.reduce((sum, s, i) => sum + (kids[i].opts.fill ? 0 : s.w), 0);
    const share = (target - used - gap * (kids.length - 1)) / fills;
    slots = kids.map((c) => (c.opts.fill ? { w: share } : undefined));
    sizes = kids.map((c, i) => (slots[i] ? ctx.size(c, slots[i]) : sizes[i]));
  }
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x;
  kids.forEach((c, i) => {
    ctx.draw(c, cx, node.opts.top ? y : y + (H - sizes[i].h) / 2, slots[i]);
    cx += sizes[i].w + (i < kids.length - 1 ? gap : 0);
  });
  // at least as wide as asked, so an empty (fill) row works as a spacer
  return { w: Math.max(cx - x, target), h: H };
};
