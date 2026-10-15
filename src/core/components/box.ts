import { drawIcon } from "../icons";
import type { Component, DrawContext, Size, Slot, SpecNode } from "../types";
import { framed, titleBar } from "./frame";
import { drawLabel, iconSizeFor, measureLabel } from "./label";
import { stackSize } from "./shared";

export const box: Component = (ctx, node, x, y, slot) => {
  if (node.opts.plain) return plain(ctx, node, x, y, slot);
  const title = node.text;
  const tm = title ? ctx.measure(title) : { w: 0, h: 0 };
  const { colors } = ctx.theme;
  const dark = !!node.opts.dark;
  // (collapsible) and (collapsed) put a chevron at the end of the title bar
  const folds = !!(node.opts.collapsible || node.opts.collapsed);
  const icon = folds ? iconSizeFor(ctx) : 0;
  const barH = ctx.measure(title).h + 20;
  const minW = Math.max(tm.w + 2 * 12 + (folds ? icon + 12 : 0), 120);
  const chevron = (W: number, name: string) =>
    drawIcon(ctx, name, x + W - 12 - icon, y + (barH - icon) / 2, icon);
  if (node.opts.collapsed) {
    const W = Math.max(node.opts.w || 0, slot?.w || 0, minW);
    ctx.rect(x, y, W, barH, {
      width: 2,
      ...(dark ? { fill: colors.dark, color: colors.dark } : {}),
    });
    if (title) ctx.text(x + 12, y + 10, title, tm);
    chevron(W, "chevron-down");
    return { w: W, h: barH };
  }
  return framed(ctx, node, x, y, slot, {
    top: title || folds ? barH : 0,
    minW,
    emptyH: title || folds ? barH + 80 : 100,
    ...(dark ? { fill: colors.dark, color: colors.dark } : {}),
    decorate: (W) => {
      if (title || folds) titleBar(ctx, x, y, W, title);
      if (folds) chevron(W, "chevron-up");
    },
  });
};

/** box (plain): its children stacked, with no frame or padding; a title is a line of text. */
function plain(ctx: DrawContext, node: SpecNode, x: number, y: number, slot?: Slot): Size {
  const { stack } = ctx.theme.gap;
  const label = node.text ? measureLabel(ctx, node.text) : null;
  const natural = stackSize(ctx, node.children, stack);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, natural.w, label?.w ?? 0);
  let h = 0;
  if (label) {
    drawLabel(ctx, x, y, label);
    h = label.h;
  }
  if (node.children.length) {
    if (label) h += stack;
    h += ctx.stack(node.children, x, y + h, stack, W).h;
  }
  return { w: W, h: Math.max(node.opts.h || 0, slot?.h || 0, h) };
}
