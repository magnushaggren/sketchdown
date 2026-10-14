import type { Component } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines } from "./shared";

/** A tinted message box; each line is a label, so icons and links work. */
export const alert: Component = (ctx, node, x, y, slot) => {
  const PAD_X = 12,
    PAD_Y = 10;
  const labels = (contentLines(node).length ? contentLines(node) : ["Alert"]).map((l) =>
    measureLabel(ctx, l),
  );
  const contentW = Math.max(...labels.map((l) => l.w));
  const contentH = labels.reduce((h, l) => h + l.h, 0);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, contentW + 2 * PAD_X);
  const H = Math.max(node.opts.h || 0, contentH + 2 * PAD_Y);
  ctx.rect(x, y, W, H, { fill: ctx.theme.colors.selected, rounded: true });
  let cy = y + (H - contentH) / 2;
  for (const label of labels) {
    drawLabel(ctx, x + PAD_X, cy, label);
    cy += label.h;
  }
  return { w: W, h: H };
};

const PERCENT = /(-?\d+(?:\.\d+)?)\s*%/;

/** A progress bar; text besides the percentage goes above it. */
export const progress: Component = (ctx, node, x, y, slot) => {
  const BAR_H = 14,
    WIDTH = 200,
    LABEL_GAP = 6;
  const str = contentLines(node).join(" ");
  const m = str.match(PERCENT);
  const value = m ? Math.min(100, Math.max(0, Number(m[1]))) / 100 : 0;
  const title = str.replace(PERCENT, "").trim();
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || WIDTH;
  const { colors } = ctx.theme;
  let by = y;
  if (title) {
    const label = measureLabel(ctx, title);
    drawLabel(ctx, x, y, label);
    by += label.h + LABEL_GAP;
  }
  ctx.rect(x, by, W, BAR_H, { fill: colors.fill, rounded: true });
  if (value > 0) ctx.rect(x, by, W * value, BAR_H, { fill: colors.primary, rounded: true });
  return { w: W, h: by - y + BAR_H };
};

/** A small dark box with light text and a pointer under its left part. */
export const tooltip: Component = (ctx, node, x, y) => {
  const PAD_X = 10,
    PAD_Y = 6,
    POINTER = 8;
  const label = measureLabel(ctx, contentLines(node).join(" ") || "Tooltip");
  const W = label.w + 2 * PAD_X;
  const H = label.h + 2 * PAD_Y;
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H, { fill: colors.dark, color: colors.dark, rounded: true });
  const ink = ctx.ink;
  if (ink !== colors.disabled) ctx.ink = colors.onDark;
  drawLabel(ctx, x + PAD_X, y + PAD_Y, label);
  ctx.ink = ink;
  const px = x + Math.min(16, W / 2 - POINTER);
  ctx.line(
    [
      [px, y + H],
      [px + POINTER, y + H + POINTER],
      [px + 2 * POINTER, y + H],
    ],
    2,
    colors.dark,
  );
  return { w: W, h: H + POINTER };
};

/** A crossed placeholder: "image: 320x180 Caption". */
export const image: Component = (ctx, node, x, y, slot) => {
  const str = contentLines(node).join(" ");
  const m = str.match(/(\d+)\s*[x×]\s*(\d+)/);
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || (m ? Number(m[1]) : 200);
  const H = Math.max(node.opts.h || 0, slot?.h || 0) || (m ? Number(m[2]) : 120);
  const caption = (m ? str.replace(m[0], "") : str).trim();
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H);
  ctx.line([
    [x, y],
    [x + W, y + H],
  ]);
  ctx.line([
    [x + W, y],
    [x, y + H],
  ]);
  if (caption) {
    // a white patch under the caption breaks the cross, so the text stays readable
    const label = measureLabel(ctx, caption);
    const lx = x + (W - label.w) / 2,
      ly = y + (H - label.h) / 2;
    ctx.rect(lx - 6, ly - 2, label.w + 12, label.h + 4, { fill: colors.paper, noStroke: true });
    drawLabel(ctx, lx, ly, label, ctx.ink === colors.disabled ? {} : { color: colors.muted });
  }
  return { w: W, h: H };
};

/**
 * A dashed box for a component the syntax can't draw yet:
 * "placeholder: 240x40 Date picker". It grows to fit its name.
 */
export const placeholder: Component = (ctx, node, x, y, slot) => {
  const PAD_X = 12,
    PAD_Y = 8,
    MIN_W = 120,
    MIN_H = 40;
  const str = contentLines(node).join(" ");
  const m = str.match(/(\d+)\s*[x×]\s*(\d+)/);
  const name = (m ? str.replace(m[0], "") : str).trim();
  const label = name ? measureLabel(ctx, name) : null;
  const fitW = label ? label.w + 2 * PAD_X : 0,
    fitH = label ? label.h + 2 * PAD_Y : 0;
  const W = Math.max(fitW, Math.max(node.opts.w || 0, slot?.w || 0) || (m ? Number(m[1]) : MIN_W));
  const H = Math.max(fitH, Math.max(node.opts.h || 0, slot?.h || 0) || (m ? Number(m[2]) : MIN_H));
  const { colors } = ctx.theme;
  ctx.rect(x, y, W, H, { rounded: true, dashed: true });
  if (label) {
    const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
    drawLabel(ctx, x + (W - label.w) / 2, y + (H - label.h) / 2, label, grey);
  }
  return { w: W, h: H };
};
