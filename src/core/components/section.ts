import { drawIcon } from "../icons";
import type { Component } from "../types";
import { drawLabel, iconSizeFor, measureLabel } from "./label";
import { stackSize } from "./shared";

/**
 * A header line over a group, with no frame: the title at the left, a grey
 * count and a chevron at the right. (collapsed) hides the children.
 */
export const section: Component = (ctx, node, x, y, slot) => {
  const GAP = 8,
    MIN_GAP = 24;
  const { stack } = ctx.theme.gap;
  const { colors } = ctx.theme;
  const label = measureLabel(ctx, node.text || " ");
  const icon = iconSizeFor(ctx);
  const count = node.opts.count !== undefined ? String(node.opts.count) : "";
  const cm = count ? ctx.measure(count) : null;
  const headerH = Math.max(label.h, icon);
  const open = !node.opts.collapsed && node.children.length > 0;
  const natural = open ? stackSize(ctx, node.children, stack) : { w: 0, h: 0 };
  const W = Math.max(
    node.opts.w || 0,
    slot?.w || 0,
    natural.w,
    label.w + MIN_GAP + (cm ? cm.w + GAP : 0) + icon,
  );
  drawLabel(ctx, x, y + (headerH - label.h) / 2, label);
  if (cm) {
    const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
    ctx.text(x + W - icon - GAP - cm.w, y + (headerH - cm.h) / 2, count, cm, grey);
  }
  const chevron = node.opts.collapsed ? "chevron-down" : "chevron-up";
  drawIcon(ctx, chevron, x + W - icon, y + (headerH - icon) / 2, icon);
  if (!open) return { w: W, h: Math.max(node.opts.h || 0, headerH) };
  const content = ctx.stack(node.children, x, y + headerH + stack, stack, W);
  return { w: W, h: Math.max(node.opts.h || 0, slot?.h || 0, headerH + stack + content.h) };
};
