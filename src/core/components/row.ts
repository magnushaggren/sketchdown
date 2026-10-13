import type { Component } from "../types";

export const row: Component = (ctx, node, x, y) => {
  const gap = ctx.theme.gap.row;
  const sizes = node.children.map((c) => ctx.size(c));
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x;
  node.children.forEach((c, i) => {
    ctx.draw(c, cx, y + (H - sizes[i].h) / 2);
    cx += sizes[i].w + (i < node.children.length - 1 ? gap : 0);
  });
  return { w: cx - x, h: H };
};
