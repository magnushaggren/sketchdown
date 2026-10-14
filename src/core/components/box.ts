import type { Component } from "../types";
import { needsWidthFirst, stackSize } from "./shared";

export const box: Component = (ctx, node, x, y, slot) => {
  const { pad, stack } = ctx.theme.gap;
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const contentTop = title ? y + tm.h + 2 * 10 + pad * 0.75 : y + pad;
  const minW = Math.max(node.opts.w || 0, slot?.w || 0, tm.w + 2 * 12, 120);
  let content;
  let W: number;
  if (needsWidthFirst(node, slot)) {
    // (fill) children stretch to the box's inner width, so find it first
    W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
    content = ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
  } else {
    content = ctx.stack(node.children, x + pad, contentTop, stack);
    W = Math.max(minW, content.w + 2 * pad);
  }
  const H = Math.max(
    node.opts.h || 0,
    slot?.h || 0,
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
