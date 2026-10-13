import type { Component } from "../types";
import { contentLines, splitItems, starred } from "./shared";

export const dropdown: Component = (ctx, node, x, y) => {
  const raw = splitItems(contentLines(node).join("|"));
  const { sel, labels } = starred(raw.length ? raw : ["Select…"]);
  const arrowW = 28,
    padX = 10;
  const textW = Math.max(...labels.map((l) => ctx.measure(l).w));
  const m = ctx.measure(labels[sel]);
  const w = Math.max(node.opts.w || 0, 120, textW + 2 * padX + arrowW);
  const h = m.h + 16;
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
  ctx.text(x + padX, y + (h - m.h) / 2, labels[sel], m);
  return { w, h };
};
