import type { DrawContext, Size, Slot, SpecNode } from "../types";
import { drawLabel, measureLabel } from "./label";

const PAD_X = 16,
  PAD_Y = 8;

/**
 * The frameless tab styles: (segmented) is one bordered strip with the
 * active part filled; (underline) is labels on a thin line, the active one
 * underlined thickly and the others grey. Children, if any, are stacked
 * below without a frame.
 */
export function tabStrip(
  ctx: DrawContext,
  node: SpecNode,
  x: number,
  y: number,
  labels: string[],
  sel: number,
  slot?: Slot,
): Size {
  const { colors, gap } = ctx.theme;
  const segmented = !!node.opts.segmented;
  const ls = labels.map((l) => measureLabel(ctx, l));
  const h = Math.max(...ls.map((l) => l.h)) + 2 * PAD_Y;
  const natural = ls.map((l) => l.w + 2 * PAD_X);
  const naturalW = natural.reduce((a, b) => a + b, 0);
  // stretched: segments share the extra width; underlined tabs keep theirs
  const target = Math.max(node.opts.w || 0, slot?.w || 0);
  const extra = segmented && target > naturalW ? (target - naturalW) / ls.length : 0;
  const widths = natural.map((w) => w + extra);
  const W = Math.max(
    target,
    widths.reduce((a, b) => a + b, 0),
  );

  let cx = x;
  if (segmented) {
    widths.forEach((w, i) => {
      if (i === sel) ctx.rect(cx, y, w, h, { fill: colors.primary, noStroke: true });
      cx += w;
    });
    ctx.rect(x, y, W, h);
    cx = x;
    widths.forEach((w, i) => {
      if (i > 0) {
        ctx.line([
          [cx, y],
          [cx, y + h],
        ]);
      }
      cx += w;
    });
  } else {
    ctx.line([
      [x, y + h],
      [x + W, y + h],
    ]);
  }
  cx = x;
  ls.forEach((l, i) => {
    const w = widths[i];
    const ink = ctx.ink;
    if (!segmented && i !== sel && ink === null) ctx.ink = colors.muted;
    drawLabel(ctx, cx + (w - l.w) / 2, y + (h - l.h) / 2, l);
    ctx.ink = ink;
    if (!segmented && i === sel) {
      ctx.line(
        [
          [cx, y + h - 1],
          [cx + w, y + h - 1],
        ],
        2,
      );
    }
    cx += w;
  });

  if (!node.children.length) return { w: W, h };
  const content = ctx.stack(node.children, x, y + h + gap.stack, gap.stack, W);
  return { w: Math.max(W, content.w), h: h + gap.stack + content.h };
}
