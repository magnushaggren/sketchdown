import { INK } from "../theme";
import type { Component, DrawContext, Size, SpecNode } from "../types";
import { drawLabel, measureLabel } from "./label";
import { BOX, contentLines, splitItems } from "./shared";

const GAP = 8,
  ROW_GAP = 8;

interface Item {
  on: boolean;
  label: string;
}

/** Items split on "|" and continuation lines; a leading * or a mark turns one on. */
function items(node: SpecNode, mark: RegExp, fallback: string): Item[] {
  const out = splitItems(contentLines(node).join("|"), false).map((t): Item => {
    const m = t.match(mark);
    if (m) return { on: !!m[1] && !/^(off| )$/i.test(m[1]), label: m[2] };
    if (t.startsWith("*")) return { on: true, label: t.slice(1).trim() };
    return { on: false, label: t };
  });
  return out.length ? out : [{ on: false, label: fallback }];
}

/** Stacks items as a mark with a label beside it, as checkboxes do. */
function stackItems(
  ctx: DrawContext,
  x: number,
  y: number,
  list: Item[],
  mark: Size,
  drawMark: (mx: number, my: number, on: boolean) => void,
): Size {
  let w = 0,
    cy = y;
  list.forEach((it, i) => {
    const label = it.label ? measureLabel(ctx, it.label) : null;
    const rh = Math.max(label?.h ?? 0, mark.h);
    drawMark(x, cy + (rh - mark.h) / 2, it.on);
    if (label) drawLabel(ctx, x + mark.w + GAP, cy + (rh - label.h) / 2, label);
    w = Math.max(w, mark.w + (label ? GAP + label.w : 0));
    cy += rh + (i < list.length - 1 ? ROW_GAP : 0);
  });
  return { w, h: cy - y };
}

/** Radio buttons: "Small | *Medium", or "( ) Small | (o) Medium". */
export const radio: Component = (ctx, node, x, y) => {
  const list = items(node, /^\(([oOxX* ])?\)\s*(.*)$/, "Option");
  return stackItems(ctx, x, y, list, { w: BOX, h: BOX }, (mx, my, on) => {
    ctx.ellipse(mx, my, BOX, BOX, { fill: ctx.theme.colors.paper });
    if (on) ctx.ellipse(mx + 4, my + 4, BOX - 8, BOX - 8, { fill: INK });
  });
};

const TRACK_W = 32,
  TRACK_H = 18,
  KNOB = 12;

/** Switches: "[on] Wi-Fi | [off] Bluetooth", or * for on. */
export const toggle: Component = (ctx, node, x, y) => {
  const list = items(node, /^\[(on|off)\]\s*(.*)$/i, "Toggle");
  const { colors } = ctx.theme;
  return stackItems(ctx, x, y, list, { w: TRACK_W, h: TRACK_H }, (mx, my, on) => {
    ctx.rect(mx, my, TRACK_W, TRACK_H, { fill: on ? colors.primary : colors.fill, rounded: true });
    const inset = (TRACK_H - KNOB) / 2;
    const kx = on ? mx + TRACK_W - inset - KNOB : mx + inset;
    ctx.ellipse(kx, my + inset, KNOB, KNOB, { fill: colors.paper });
  });
};

const SLIDER_W = 200,
  SLIDER_KNOB = 16,
  SLIDER_TRACK = 6;

/** A slider at a percentage: "slider: 40%". */
export const slider: Component = (ctx, node, x, y, slot) => {
  const m = contentLines(node)
    .join(" ")
    .match(/(-?\d+(?:\.\d+)?)\s*%?/);
  const value = Math.min(100, Math.max(0, m ? Number(m[1]) : 50)) / 100;
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || SLIDER_W;
  const { colors } = ctx.theme;
  // the track is inset by the knob's radius, so the knob never sticks out
  const r = SLIDER_KNOB / 2;
  const trackW = W - SLIDER_KNOB;
  const ty = y + (SLIDER_KNOB - SLIDER_TRACK) / 2;
  ctx.rect(x + r, ty, trackW, SLIDER_TRACK, { fill: colors.fill, rounded: true });
  if (value > 0) {
    ctx.rect(x + r, ty, trackW * value, SLIDER_TRACK, { fill: colors.primary, rounded: true });
  }
  ctx.ellipse(x + trackW * value, y, SLIDER_KNOB, SLIDER_KNOB, { fill: colors.paper, width: 2 });
  return { w: W, h: SLIDER_KNOB };
};
