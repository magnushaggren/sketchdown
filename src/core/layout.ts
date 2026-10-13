import { COMPONENTS } from "./components";
import { DEFAULT_THEME } from "./theme";
import type { DrawContext, DrawOp, MeasureText, Size, SpecNode, TextStyle, Theme } from "./types";

export interface LayoutEnv {
  measure: MeasureText;
  style: TextStyle;
  theme?: Theme;
}

/** Turns a parsed tree into draw ops, in drawing (z) order, with its top-left at origin. */
export function layout(
  tree: SpecNode,
  origin: { x: number; y: number },
  env: LayoutEnv,
): { ops: DrawOp[]; size: Size } {
  const ops: DrawOp[] = [];
  const textStyle: TextStyle = { fontSize: env.style.fontSize, fontFamily: env.style.fontFamily };
  const ctx: DrawContext = {
    theme: env.theme ?? DEFAULT_THEME,
    dry: false,
    measure(str) {
      return env.measure(str && str.length ? str : " ", textStyle);
    },
    rect(x, y, w, h, o = {}) {
      if (ctx.dry) return;
      ops.push({
        kind: "rect",
        x,
        y,
        w,
        h,
        fill: o.fill || null,
        stroke: !o.noStroke,
        strokeWidth: o.width || 1,
        rounded: !!o.rounded,
      });
    },
    line(pts, strokeWidth = 1) {
      if (ctx.dry) return;
      const points = pts.filter(
        (p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1],
      );
      ops.push({ kind: "line", points, strokeWidth });
    },
    text(x, y, str, size) {
      if (ctx.dry || !str) return;
      ops.push({ kind: "text", x, y, w: size.w, h: size.h, text: str });
    },
    draw(node, x, y) {
      return COMPONENTS[node.type](ctx, node, x, y);
    },
    size(node) {
      const saved = ctx.dry;
      ctx.dry = true;
      const r = ctx.draw(node, 0, 0);
      ctx.dry = saved;
      return r;
    },
    stack(children, x, y, gap) {
      let w = 0,
        cy = y;
      children.forEach((c, i) => {
        const r = ctx.draw(c, x, cy);
        w = Math.max(w, r.w);
        cy += r.h + (i < children.length - 1 ? gap : 0);
      });
      return { w, h: cy - y };
    },
  };
  const size = ctx.draw(tree, origin.x, origin.y);
  return { ops, size };
}
