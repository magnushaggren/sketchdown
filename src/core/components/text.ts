import type { Component } from "../types";
import { contentLines } from "./shared";

export const text: Component = (ctx, node, x, y) => {
  const str = contentLines(node).join("\n") || "Text";
  const m = ctx.measure(str);
  ctx.text(x, y, str, m);
  return { w: m.w, h: m.h };
};
