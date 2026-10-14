import type { Component } from "../types";
import { framed, titleBar } from "./frame";

export const box: Component = (ctx, node, x, y, slot) => {
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const { colors } = ctx.theme;
  const dark = !!node.opts.dark;
  return framed(ctx, node, x, y, slot, {
    top: title ? tm.h + 20 : 0,
    minW: Math.max(tm.w + 2 * 12, 120),
    emptyH: title ? tm.h + 20 + 80 : 100,
    ...(dark ? { fill: colors.dark, color: colors.dark } : {}),
    decorate: (W) => {
      if (title) titleBar(ctx, x, y, W, title);
    },
  });
};
