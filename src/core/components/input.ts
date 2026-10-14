import type { Component, SpecNode } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines } from "./shared";

const PAD_X = 10;

/** What a field shows: search gets a leading icon, password is masked. */
function fieldText(node: SpecNode): string {
  const text = contentLines(node).join(" ");
  if (node.type === "password") return "•".repeat(Math.min(text.length || 8, 24));
  if (node.type === "search") return `{search} ${text || "Search"}`;
  return text;
}

/** input, search and password: a one-line text field. */
export const input: Component = (ctx, node, x, y, slot) => {
  const label = measureLabel(ctx, fieldText(node));
  const lineH = ctx.measure(" ").h;
  const h = Math.max(node.opts.h || 0, lineH + 16);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 200, label.w + 2 * PAD_X);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (label.w) drawLabel(ctx, x + PAD_X, y + (h - label.h) / 2, label);
  return { w, h };
};

/** A multi-line field; every content line is a line of text. */
export const textarea: Component = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join("\n");
  const m = str ? ctx.measure(str) : { w: 0, h: 0 };
  const h = Math.max(node.opts.h || 0, slot?.h || 0, m.h + 16, 80);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 240, m.w + 2 * PAD_X);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (str) ctx.text(x + PAD_X, y + 8, str, m);
  // resize grip in the bottom-right corner
  const gx = x + w - 4,
    gy = y + h - 4;
  ctx.line([
    [gx - 10, gy],
    [gx, gy - 10],
  ]);
  ctx.line([
    [gx - 5, gy],
    [gx, gy - 5],
  ]);
  return { w, h };
};
