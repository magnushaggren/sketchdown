import type { DrawContext, Size, Slot, SpecNode } from "../types";

/** The component's own line plus its continuation lines, without empty ones. */
export function contentLines(node: SpecNode): string[] {
  return [node.text, ...node.body].filter(Boolean);
}

export function splitItems(s: string, allowComma = true): string[] {
  return (s.includes("|") || !allowComma ? s.split("|") : s.split(","))
    .map((t) => t.trim())
    .filter((t) => t.length);
}

export function parseCheck(t: string): { checked: boolean; label: string } | null {
  const cb = t.match(/^\[( |x|X)?\]\s*(.*)$/);
  if (cb) return { checked: !!cb[1] && cb[1] !== " ", label: cb[2] };
  return null;
}

export function starred(items: string[]): { sel: number; labels: string[] } {
  const sel = items.findIndex((t) => t.startsWith("*") || t.endsWith("*"));
  const labels = items.map((t) => t.replace(/^\*\s*/, "").replace(/\s*\*$/, ""));
  return { sel: sel < 0 ? 0 : sel, labels };
}

export const BOX = 14;

export function checkMark(ctx: DrawContext, x: number, y: number, checked: boolean): void {
  ctx.rect(x, y, BOX, BOX, { fill: ctx.theme.colors.paper });
  if (checked) {
    ctx.line(
      [
        [x + 3, y + 7],
        [x + 6, y + 11],
        [x + 12, y + 2],
      ],
      2,
    );
  }
}

/** Size of a stack of children, without drawing it. */
export function stackSize(
  ctx: DrawContext,
  children: SpecNode[],
  gap: number,
  width?: number,
): Size {
  const saved = ctx.dry;
  ctx.dry = true;
  const r = ctx.stack(children, 0, 0, gap, width);
  ctx.dry = saved;
  return r;
}

/** Whether a container must know its width before drawing its children. */
export function needsWidthFirst(node: SpecNode, slot?: Slot): boolean {
  return !!slot?.w || node.children.some((c) => c.opts.fill);
}
