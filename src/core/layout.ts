import { COMPONENTS } from "./components";
import { DEFAULT_THEME } from "./theme";
import type {
  DrawContext,
  DrawOp,
  MeasureText,
  NodeType,
  Size,
  SpecNode,
  TextStyle,
  Theme,
} from "./types";

/** Components that paint their own light background. */
const LIGHT_SURFACES = new Set<NodeType>([
  "button",
  "dropdown",
  "input",
  "search",
  "password",
  "textarea",
  "grid",
  "avatar",
  "window",
  "dialog",
  "browser",
  "phone",
]);

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
  // Optional keys are only added when set, so ops without overrides stay
  // exactly as they were before overrides existed.
  const color = (c: string | null | undefined) => (c ? { color: c } : {});
  const ctx: DrawContext = {
    theme: env.theme ?? DEFAULT_THEME,
    dry: false,
    fontSize: env.style.fontSize,
    ink: null,
    measure(str, fontSize) {
      const style = fontSize ? { ...textStyle, fontSize } : textStyle;
      return env.measure(str && str.length ? str : " ", style);
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
        ...color(o.color ?? ctx.ink),
      });
    },
    ellipse(x, y, w, h, o = {}) {
      if (ctx.dry) return;
      ops.push({
        kind: "ellipse",
        x,
        y,
        w,
        h,
        fill: o.fill || null,
        stroke: !o.noStroke,
        strokeWidth: o.width || 1,
        ...color(o.color ?? ctx.ink),
      });
    },
    line(pts, strokeWidth = 1, c) {
      if (ctx.dry) return;
      const points = pts.filter(
        (p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1],
      );
      ops.push({ kind: "line", points, strokeWidth, ...color(c ?? ctx.ink) });
    },
    text(x, y, str, size, o = {}) {
      if (ctx.dry || !str) return;
      ops.push({
        kind: "text",
        x,
        y,
        w: size.w,
        h: size.h,
        text: str,
        ...color(o.color ?? ctx.ink),
        ...(o.fontSize ? { fontSize: o.fontSize } : {}),
      });
    },
    draw(node, x, y, slot) {
      const ink = ctx.ink;
      const { colors } = ctx.theme;
      if (node.opts.disabled) ctx.ink = colors.disabled;
      else if (node.opts.dark) ctx.ink = colors.onDark;
      // light-coloured controls on a dark panel keep the normal ink
      else if (ink === colors.onDark && LIGHT_SURFACES.has(node.type)) ctx.ink = null;
      const r = COMPONENTS[node.type](ctx, node, x, y, slot);
      ctx.ink = ink;
      return r;
    },
    size(node, slot) {
      const saved = ctx.dry;
      ctx.dry = true;
      const r = ctx.draw(node, 0, 0, slot);
      ctx.dry = saved;
      return r;
    },
    stack(children, x, y, gap, width) {
      let fillW = width ?? 0;
      if (width === undefined && children.some((c) => c.opts.fill)) {
        fillW = Math.max(0, ...children.map((c) => ctx.size(c).w));
      }
      let w = 0,
        cy = y;
      children.forEach((c, i) => {
        const r = ctx.draw(c, x, cy, c.opts.fill && fillW ? { w: fillW } : undefined);
        w = Math.max(w, r.w);
        cy += r.h + (i < children.length - 1 ? gap : 0);
      });
      return { w, h: cy - y };
    },
  };
  const size = ctx.draw(tree, origin.x, origin.y);
  return { ops, size };
}
