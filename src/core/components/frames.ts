import { drawIcon } from "../icons";
import type { Component } from "../types";
import { framed, titleBar } from "./frame";
import { iconSizeFor } from "./label";
import { contentLines, splitItems } from "./shared";

const CONTROL_GAP = 8;

/** A desktop window: title bar with minimise, maximise and close controls. */
export const windowFrame: Component = (ctx, node, x, y, slot) => {
  const title = node.text;
  const bar = ctx.measure(title).h + 20;
  const s = iconSizeFor(ctx);
  const controls = 3 * s + 2 * CONTROL_GAP;
  return framed(ctx, node, x, y, slot, {
    top: bar,
    minW: Math.max(320, (title ? ctx.measure(title).w : 0) + 12 + 24 + controls + 12),
    emptyH: bar + 200,
    fill: ctx.theme.colors.paper,
    decorate: (W) => {
      titleBar(ctx, x, y, W, title);
      const cy = y + (bar - s) / 2;
      const close = x + W - 12 - s;
      const max = close - CONTROL_GAP - s;
      const min = max - CONTROL_GAP - s;
      ctx.line([
        [min + 0.2 * s, cy + 0.8 * s],
        [min + 0.8 * s, cy + 0.8 * s],
      ]);
      ctx.rect(max, cy, s, s);
      drawIcon(ctx, "close", close, cy, s);
    },
  });
};

const SHADOW = 8;

/** A dialog over the page: title bar with a close control, and a shadow. */
export const dialog: Component = (ctx, node, x, y, slot) => {
  const title = node.text;
  const bar = ctx.measure(title).h + 20;
  const s = iconSizeFor(ctx);
  return framed(ctx, node, x, y, slot, {
    top: bar,
    minW: Math.max(280, (title ? ctx.measure(title).w : 0) + 12 + 24 + s + 12),
    emptyH: bar + 120,
    fill: ctx.theme.colors.paper,
    shadow: SHADOW,
    decorate: (W) => {
      titleBar(ctx, x, y, W, title);
      drawIcon(ctx, "close", x + W - 12 - s, y + (bar - s) / 2, s);
    },
  });
};

/** A browser window: a tab with the title, then back/forward and the address. */
export const browser: Component = (ctx, node, x, y, slot) => {
  const [title = "", url = ""] = node.text.split("|").map((t) => t.trim());
  const lineH = ctx.measure(" ").h;
  const s = iconSizeFor(ctx);
  const tabBar = title ? lineH + 12 : 0;
  const addressBar = lineH + 20;
  const tm = ctx.measure(title);
  const tabW = tm.w + 32;
  const { colors } = ctx.theme;
  return framed(ctx, node, x, y, slot, {
    top: tabBar + addressBar,
    minW: Math.max(480, title ? 8 + tabW + 8 : 0),
    emptyH: tabBar + addressBar + 240,
    fill: colors.paper,
    decorate: (W) => {
      if (title) {
        // one outline along the bottom of the bar that rises around the tab
        ctx.line([
          [x, y + tabBar],
          [x + 8, y + tabBar],
          [x + 8, y + 6],
          [x + 8 + tabW, y + 6],
          [x + 8 + tabW, y + tabBar],
          [x + W, y + tabBar],
        ]);
        ctx.text(x + 8 + 16, y + 6 + (tabBar - 6 - tm.h) / 2, title, tm);
      }
      const top = y + tabBar;
      const iy = top + (addressBar - s) / 2;
      drawIcon(ctx, "back", x + 12, iy, s);
      drawIcon(ctx, "chevron-right", x + 12 + s + CONTROL_GAP, iy, s);
      const fx = x + 12 + 2 * s + 2 * CONTROL_GAP;
      const fh = lineH + 8;
      ctx.rect(fx, top + 6, x + W - 12 - fx, fh, { fill: colors.paper, rounded: true });
      if (url) {
        const um = ctx.measure(url);
        ctx.text(fx + 8, top + 6 + (fh - um.h) / 2, url, um, { color: colors.muted });
      }
      ctx.line([
        [x, top + addressBar],
        [x + W, top + addressBar],
      ]);
    },
  });
};

const PHONE_W = 375,
  PHONE_H = 667,
  HOME_BAR = 24;

/** A phone: status bar, an app bar with the title if there is one, a home indicator. */
export const phone: Component = (ctx, node, x, y, slot) => {
  const title = node.text;
  const lineH = ctx.measure(" ").h;
  const status = lineH + 8;
  const appBar = title ? lineH + 20 : 0;
  const { colors } = ctx.theme;
  return framed(ctx, node, x, y, slot, {
    top: status + appBar,
    bottom: HOME_BAR,
    minW: Math.max(node.opts.w ? 0 : PHONE_W, ctx.measure(title).w + 48),
    minH: node.opts.h ? 0 : PHONE_H,
    emptyH: 0,
    fill: colors.paper,
    rounded: true,
    decorate: (W, H) => {
      const time = ctx.measure("9:41");
      ctx.text(x + 24, y + (status - time.h) / 2, "9:41", time);
      ctx.rect(x + W - 24 - 22, y + (status - 10) / 2, 22, 10);
      if (title) {
        const tm = ctx.measure(title);
        ctx.text(x + (W - tm.w) / 2, y + status + 10, title, tm);
        ctx.line([
          [x, y + status + appBar],
          [x + W, y + status + appBar],
        ]);
      }
      ctx.line(
        [
          [x + W / 2 - 60, y + H - HOME_BAR / 2],
          [x + W / 2 + 60, y + H - HOME_BAR / 2],
        ],
        2,
      );
    },
  });
};

/** Buttons side by side on the right of the parent's width, as in a dialog footer. */
export const buttons: Component = (ctx, node, x, y, slot) => {
  const gap = ctx.theme.gap.row;
  const kids = splitItems(contentLines(node).join("|")).map((text) => ({
    type: "button" as const,
    text,
    body: [],
    children: [],
    opts: {},
  }));
  const sizes = kids.map((k) => ctx.size(k));
  const natural = sizes.reduce((sum, s) => sum + s.w, 0) + gap * Math.max(0, kids.length - 1);
  const W = Math.max(node.opts.w || 0, slot?.w || 0, natural);
  const H = Math.max(0, ...sizes.map((s) => s.h));
  let cx = x + W - natural;
  kids.forEach((k, i) => {
    ctx.draw(k, cx, y + (H - sizes[i].h) / 2);
    cx += sizes[i].w + gap;
  });
  return { w: W, h: H };
};
