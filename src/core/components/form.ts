import type { Component, DrawContext, Slot, SpecNode } from "../types";
import { box } from "./box";
import { drawLabel, measureLabel } from "./label";

/** Space between a field's label and its component. */
const LABEL_GAP = 12;
/** Label offset from the top of a tall component, as in a one-line input. */
const LABEL_TOP = 8;

/** Space before the (required) star. */
const STAR_GAP = 4;

/** A field's label, with room for the (required) star after it. */
function measureFieldLabel(ctx: DrawContext, node: SpecNode, fontSize?: number) {
  const label = measureLabel(ctx, node.text, fontSize);
  const star = node.opts.required ? ctx.measure("*", fontSize) : null;
  return { label, star, w: label.w + (star ? STAR_GAP + star.w : 0) };
}

/** Draws a measured field label and its star, if any. */
function drawFieldLabel(
  ctx: DrawContext,
  x: number,
  y: number,
  m: ReturnType<typeof measureFieldLabel>,
  o: { fontSize?: number; color?: string } = {},
) {
  drawLabel(ctx, x, y, m.label, o);
  if (m.star) {
    const fontSize = o.fontSize ? { fontSize: o.fontSize } : {};
    ctx.text(x + m.label.w + STAR_GAP, y, "*", m.star, {
      color: ctx.theme.colors.error,
      ...fontSize,
    });
  }
}

/**
 * Gives the fields of a form one label column: the fields directly in it,
 * and per position the fields side by side in its rows.
 */
function alignLabels(ctx: DrawContext, node: SpecNode): void {
  const columns: SpecNode[][] = [];
  const add = (child: SpecNode, i: number) => {
    if (child.type === "field" && !child.opts.floating) (columns[i] ??= []).push(child);
  };
  for (const child of node.children) {
    if (child.type === "row") child.children.forEach(add);
    else add(child, 0);
  }
  for (const fields of columns) {
    if (!fields) continue;
    const w = node.opts.label || Math.max(...fields.map((f) => measureFieldLabel(ctx, f).w));
    for (const f of fields) ctx.labelWidths.set(f, w);
  }
}

/** A box whose fields line up after one label column. */
export const form: Component = (ctx, node, x, y, slot) => {
  alignLabels(ctx, node);
  return box(ctx, node, x, y, slot);
};

/** A label before one component: "field: Customer | search: Search...". */
export const field: Component = (ctx, node, x, y, slot) => {
  const inner = node.children[0];
  if (node.opts.floating) return floating(ctx, node, inner, x, y, slot);
  const label = measureFieldLabel(ctx, node);
  const labelW = ctx.labelWidths.get(node) ?? label.w;
  const offset = labelW + LABEL_GAP;
  const innerSlot = slot?.w ? { w: slot.w - offset } : undefined;
  const size = ctx.size(inner, innerSlot);
  const H = Math.max(size.h, label.label.h);
  drawFieldLabel(ctx, x, y + Math.min((H - label.label.h) / 2, LABEL_TOP), label);
  ctx.draw(inner, x + offset, y + (H - size.h) / 2, innerSlot);
  return { w: offset + size.w, h: H };
};

/** The label small on the component's top border, as in Material design. */
function floating(
  ctx: DrawContext,
  node: SpecNode,
  inner: SpecNode,
  x: number,
  y: number,
  slot: Slot | undefined,
) {
  const { colors } = ctx.theme;
  const fontSize = Math.round(ctx.fontSize * 0.75);
  const label = measureFieldLabel(ctx, node, fontSize);
  const top = label.label.h / 2;
  const size = ctx.draw(inner, x, y + top, slot);
  // a patch the colour of the field breaks its border behind the label
  ctx.rect(x + 8, y, label.w + 8, label.label.h, { fill: colors.paper, noStroke: true });
  const grey = ctx.ink === colors.disabled ? {} : { color: colors.muted };
  drawFieldLabel(ctx, x + 12, y, label, { fontSize, ...grey });
  return { w: size.w, h: size.h + top };
}
