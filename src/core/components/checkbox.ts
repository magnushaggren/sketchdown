import type { Component } from "../types";
import { BOX, checkMark, contentLines, parseCheck, splitItems } from "./shared";

export const checkbox: Component = (ctx, node, x, y) => {
  const items = splitItems(contentLines(node).join("|"), false).map(
    (t) => parseCheck(t) || { checked: false, label: t },
  );
  if (!items.length) items.push({ checked: false, label: "Checkbox" });
  const gap = 8,
    rowGap = 8;
  let w = 0,
    cy = y;
  items.forEach((it, i) => {
    const m = ctx.measure(it.label);
    const rh = Math.max(m.h, BOX);
    checkMark(ctx, x, cy + (rh - BOX) / 2, it.checked);
    ctx.text(x + BOX + gap, cy + (rh - m.h) / 2, it.label, m);
    w = Math.max(w, BOX + (it.label ? gap + m.w : 0));
    cy += rh + (i < items.length - 1 ? rowGap : 0);
  });
  return { w, h: cy - y };
};
