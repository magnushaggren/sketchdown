import type { Component } from "../types";
import { contentLines, splitItems, starred, trailingButton, trailingIcon } from "./shared";

export const dropdown: Component = (ctx, node, x, y, slot) => {
  const own = trailingIcon(contentLines(node).join("|"));
  const raw = splitItems(own.text);
  const { sel, labels } = starred(raw.length ? raw : ["Select…"]);
  const arrowW = 28,
    padX = 10;
  const textW = Math.max(...labels.map((l) => ctx.measure(l).w));
  const m = ctx.measure(labels[sel]);
  const h = m.h + 16;
  // a trailing {icon} is a square button before the arrow
  const btn = own.icon ? h : 0;
  const w = Math.max(node.opts.w || 0, slot?.w || 0, 120 + btn, textW + 2 * padX + arrowW + btn);
  ctx.rect(x, y, w, h, { fill: ctx.theme.colors.paper });
  ctx.line(
    [
      [x + w - arrowW, y],
      [x + w - arrowW, y + h],
    ],
    1,
  );
  const ax = x + w - arrowW / 2,
    ay = y + h / 2;
  ctx.line(
    [
      [ax - 5, ay - 2],
      [ax, ay + 3],
      [ax + 5, ay - 2],
    ],
    2,
  );
  if (own.icon) trailingButton(ctx, x + w - arrowW, y, h, own.icon);
  if (!node.opts.empty) ctx.text(x + padX, y + (h - m.h) / 2, labels[sel], m);
  return { w, h };
};
