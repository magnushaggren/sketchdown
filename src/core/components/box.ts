import type { Component } from "../types";
import { needsWidthFirst, stackSize } from "./shared";

export const box: Component = (ctx, node, x, y, slot) => {
  const { pad, stack } = ctx.theme.gap;
  const dark = !!node.opts.dark;
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const contentTop = title ? y + tm.h + 2 * 10 + pad * 0.75 : y + pad;
  const minW = Math.max(node.opts.w || 0, slot?.w || 0, tm.w + 2 * 12, 120);
  const height = (contentH: number) =>
    Math.max(
      node.opts.h || 0,
      slot?.h || 0,
      node.children.length ? contentTop - y + contentH : title ? tm.h + 20 + 80 : 100,
    );
  const frame = (W: number, H: number) => {
    const { colors } = ctx.theme;
    ctx.rect(x, y, W, H, dark ? { width: 2, fill: colors.dark, color: colors.dark } : { width: 2 });
  };

  let W: number, H: number;
  if (dark) {
    // the dark fill must lie under the content, so the frame comes first
    const natural = stackSize(ctx, node.children, stack);
    W = Math.max(minW, natural.w + 2 * pad);
    const content = stackSize(ctx, node.children, stack, W - 2 * pad);
    H = height(content.h + pad);
    frame(W, H);
    ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
  } else {
    let content;
    if (needsWidthFirst(node, slot)) {
      // (fill) children stretch to the box's inner width, so find it first
      W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
      content = ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
    } else {
      content = ctx.stack(node.children, x + pad, contentTop, stack);
      W = Math.max(minW, content.w + 2 * pad);
    }
    H = height(content.h + pad);
    frame(W, H);
  }
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
