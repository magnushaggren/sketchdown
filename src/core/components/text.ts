import type { Component } from "../types";
import { drawLabel, isRich, measureLabel } from "./label";
import { contentLines } from "./shared";

export const text: Component = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join("\n") || "Text";
  let w: number, h: number;
  if (isRich(str)) {
    // one label per line, so each line can mix icons, links and text
    const labels = str.split("\n").map((line) => measureLabel(ctx, line));
    h = 0;
    for (const label of labels) {
      drawLabel(ctx, x, y + h, label);
      h += label.h;
    }
    w = Math.max(...labels.map((l) => l.w));
  } else {
    const m = ctx.measure(str);
    ctx.text(x, y, str, m);
    ({ w, h } = m);
  }
  // stretched text stays left-aligned and takes up the room it was given
  return { w: Math.max(w, slot?.w || 0), h };
};
