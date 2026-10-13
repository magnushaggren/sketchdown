import type { Component } from "../types";

export const box: Component = (ctx, node, x, y) => {
  const { pad, stack } = ctx.theme.gap;
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const contentTop = title ? y + tm.h + 2 * 10 + pad * 0.75 : y + pad;
  const content = ctx.stack(node.children, x + pad, contentTop, stack);
  const W = Math.max(node.opts.w || 0, content.w + 2 * pad, tm.w + 2 * 12, 120);
  const H = Math.max(
    node.opts.h || 0,
    node.children.length ? contentTop - y + content.h + pad : title ? tm.h + 20 + 80 : 100,
  );
  ctx.rect(x, y, W, H, { width: 2 });
  if (title) {
    ctx.text(x + 12, y + 10, title, tm);
    ctx.line(
      [
        [x, y + tm.h + 20],
        [x + W, y + tm.h + 20],
      ],
      1,
    );
  }
  return { w: W, h: H };
};
