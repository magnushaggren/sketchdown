import type { Component } from "../types";
import { contentLines, needsWidthFirst, splitItems, stackSize, starred } from "./shared";

export const tabs: Component = (ctx, node, x, y, slot) => {
  const { pad, stack } = ctx.theme.gap;
  const raw = splitItems(contentLines(node).join("|"));
  const { sel, labels } = starred(raw.length ? raw : ["Tab 1", "Tab 2", "Tab 3"]);
  const padX = 16,
    padY = 8,
    lift = 4;
  const ms = labels.map((l) => ctx.measure(l));
  const tabH = Math.max(...ms.map((m) => m.h)) + 2 * padY;
  const tabRects: { x: number; w: number }[] = [];
  let cx = x;
  ms.forEach((m) => {
    tabRects.push({ x: cx, w: m.w + 2 * padX });
    cx += m.w + 2 * padX;
  });
  const top = y + tabH + lift;
  const hasKids = node.children.length > 0;
  const minW = Math.max(node.opts.w || (hasKids ? 0 : 360), slot?.w || 0, cx - x + 40);
  let content;
  let W: number;
  if (needsWidthFirst(node, slot)) {
    // (fill) children stretch to the panel's inner width, so find it first
    W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
    content = ctx.stack(node.children, x + pad, top + pad, stack, W - 2 * pad);
  } else {
    content = ctx.stack(node.children, x + pad, top + pad, stack);
    W = Math.max(minW, content.w + 2 * pad);
  }
  const minH = Math.max(node.opts.h || 0, (slot?.h || 0) - tabH - lift);
  const panelH = hasKids ? Math.max(minH, content.h + 2 * pad) : minH || 160;
  const bottom = top + panelH;
  const sL = tabRects[sel].x,
    sR = tabRects[sel].x + tabRects[sel].w;
  tabRects.forEach((t, i) => {
    if (i !== sel) ctx.rect(t.x, y + lift, t.w, tabH, { fill: ctx.theme.colors.fill });
  });
  ctx.line(
    [
      [sR, top],
      [x + W, top],
      [x + W, bottom],
      [x, bottom],
      [x, top],
      [sL, top],
    ],
    2,
  );
  ctx.line(
    [
      [sL, top],
      [sL, y],
      [sR, y],
      [sR, top],
    ],
    2,
  );
  tabRects.forEach((t, i) => {
    const ty = i === sel ? y : y + lift;
    const th = i === sel ? tabH + lift : tabH;
    ctx.text(t.x + padX, ty + (th - ms[i].h) / 2, labels[i], ms[i]);
  });
  return { w: W, h: tabH + lift + panelH };
};
