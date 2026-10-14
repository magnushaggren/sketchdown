import type { Component } from "../types";
import { contentLines } from "./shared";

export const text: Component = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join("\n") || "Text";
  const m = ctx.measure(str);
  ctx.text(x, y, str, m);
  // stretched text stays left-aligned and takes up the room it was given
  return { w: Math.max(m.w, slot?.w || 0), h: m.h };
};
