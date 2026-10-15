import type { Component, SpecNode } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines, trailingButton, trailingIcon } from "./shared";

const PAD_X = 10;

/**
 * What a field shows: search gets a leading icon, password is masked.
 * (empty) shows nothing but search's icon.
 */
function fieldText(node: SpecNode, text: string): string {
  const empty = !!node.opts.empty;
  if (node.type === "password") return empty ? "" : "•".repeat(Math.min(text.length || 8, 24));
  if (node.type === "search") return empty ? "{search}" : `{search} ${text || "Search"}`;
  return empty ? "" : text;
}

/** input, search and password: a one-line text field, maybe with a trailing {icon} button. */
export const input: Component = (ctx, node, x, y, slot) => {
  const own = trailingIcon(contentLines(node).join(" "), node.type === "search");
  const label = measureLabel(ctx, fieldText(node, own.text));
  const lineH = ctx.measure(" ").h;
  const h = Math.max(node.opts.h || 0, lineH + 16);
  const btn = own.icon ? h : 0;
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 200 + btn, label.w + 2 * PAD_X + btn);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (label.w) drawLabel(ctx, x + PAD_X, y + (h - label.h) / 2, label);
  if (own.icon) trailingButton(ctx, x + w, y, h, own.icon);
  return { w, h };
};

/** A number field with up and down arrows at the right. */
export const spin: Component = (ctx, node, x, y, slot) => {
  const ARROWS = 24;
  const str = node.opts.empty ? "" : contentLines(node).join(" ");
  const label = measureLabel(ctx, str);
  const h = Math.max(node.opts.h || 0, ctx.measure(" ").h + 16);
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 80, label.w + 2 * PAD_X + ARROWS);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  if (label.w) drawLabel(ctx, x + PAD_X, y + (h - label.h) / 2, label);
  const ax = x + w - ARROWS,
    mid = y + h / 2,
    cx = ax + ARROWS / 2;
  ctx.line([
    [ax, y],
    [ax, y + h],
  ]);
  ctx.line([
    [ax, mid],
    [x + w, mid],
  ]);
  const up = y + h / 4,
    down = y + (3 * h) / 4;
  ctx.line([
    [cx - 4, up + 2],
    [cx, up - 2],
    [cx + 4, up + 2],
  ]);
  ctx.line([
    [cx - 4, down - 2],
    [cx, down + 2],
    [cx + 4, down - 2],
  ]);
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
