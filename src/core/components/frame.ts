import type { DrawContext, Size, Slot, SpecNode } from "../types";
import { needsWidthFirst, stackSize } from "./shared";

/** What a framed container draws around its children. */
export interface Chrome {
  /** Height of the bars above the content; 0 for none. */
  top: number;
  /** Extra room under the content. */
  bottom?: number;
  minW: number;
  minH?: number;
  /** Height when there are no children. */
  emptyH: number;
  /** Background; when set, the frame is drawn before the content. */
  fill?: string;
  /** Stroke colour of the frame. */
  color?: string;
  rounded?: boolean;
  /** Offset of a grey shadow to the bottom right; adds to the size. */
  shadow?: number;
  /** Draws bars and controls, last, once the size is known. */
  decorate?(W: number, H: number): void;
}

/** A frame with its children stacked inside: box, window, dialog, browser, phone. */
export function framed(
  ctx: DrawContext,
  node: SpecNode,
  x: number,
  y: number,
  slot: Slot | undefined,
  chrome: Chrome,
): Size {
  const { pad, stack } = ctx.theme.gap;
  const shadow = chrome.shadow ?? 0;
  const contentTop = chrome.top ? y + chrome.top + pad * 0.75 : y + pad;
  const minW = Math.max(node.opts.w || 0, (slot?.w || 0) - shadow, chrome.minW);
  const height = (contentH: number) =>
    Math.max(
      node.opts.h || 0,
      (slot?.h || 0) - shadow,
      chrome.minH ?? 0,
      node.children.length ? contentTop - y + contentH + (chrome.bottom ?? 0) : chrome.emptyH,
    );
  const frame = (W: number, H: number) => {
    if (shadow) {
      ctx.rect(x + shadow, y + shadow, W, H, {
        fill: ctx.theme.colors.disabled,
        noStroke: true,
        rounded: chrome.rounded,
      });
    }
    ctx.rect(x, y, W, H, {
      width: 2,
      ...(chrome.fill ? { fill: chrome.fill } : {}),
      ...(chrome.color ? { color: chrome.color } : {}),
      ...(chrome.rounded ? { rounded: true } : {}),
    });
  };

  let W: number, H: number;
  if (chrome.fill) {
    // the fill must lie under the content, so the frame comes first
    const natural = stackSize(ctx, node.children, stack);
    W = Math.max(minW, natural.w + 2 * pad);
    const content = stackSize(ctx, node.children, stack, W - 2 * pad);
    H = height(content.h + pad);
    frame(W, H);
    ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
  } else {
    let content;
    if (needsWidthFirst(node, slot)) {
      // (fill) children stretch to the inner width, so find it first
      W = Math.max(minW, stackSize(ctx, node.children, stack).w + 2 * pad);
      content = ctx.stack(node.children, x + pad, contentTop, stack, W - 2 * pad);
    } else {
      content = ctx.stack(node.children, x + pad, contentTop, stack);
      W = Math.max(minW, content.w + 2 * pad);
    }
    H = height(content.h + pad);
    frame(W, H);
  }
  chrome.decorate?.(W, H);
  return { w: W + shadow, h: H + shadow };
}

/** A title bar like a box's: the title at the left, a line underneath. */
export function titleBar(ctx: DrawContext, x: number, y: number, W: number, title: string): void {
  if (title) ctx.text(x + 12, y + 10, title, ctx.measure(title));
  const h = ctx.measure(title).h + 20;
  ctx.line(
    [
      [x, y + h],
      [x + W, y + h],
    ],
    1,
  );
}
