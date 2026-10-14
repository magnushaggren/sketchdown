import { INK } from "../core/theme";
import type { DrawOp, MeasureText, Style } from "../core/types";
import type { EaStyle, ExcalidrawAutomate } from "./ea-types";

/** Text measurement backed by Excalidraw, for injecting into layout(). */
export function eaMeasure(ea: ExcalidrawAutomate): MeasureText {
  return (text, style) => {
    ea.style.fontSize = style.fontSize;
    ea.style.fontFamily = style.fontFamily;
    const m = ea.measureText(text);
    return { w: m.width, h: m.height };
  };
}

// ea.style is shared state, so it is set in full before every add call.
function setStyle(ea: ExcalidrawAutomate, style: Style, over: Partial<EaStyle>): void {
  Object.assign(ea.style, {
    strokeColor: style.stroke,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: style.roughness,
    roundness: null,
    opacity: 100,
    angle: 0,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    textAlign: "left",
    ...over,
  });
}

/** Adds the ops to the ea workbench (not yet to the view) and returns the element ids. */
export function renderOps(ea: ExcalidrawAutomate, ops: DrawOp[], style: Style): string[] {
  const ids: string[] = [];
  for (const op of ops) {
    switch (op.kind) {
      case "rect":
      case "ellipse":
        setStyle(ea, style, {
          strokeColor: op.stroke ? (op.color ?? style.stroke) : "transparent",
          backgroundColor:
            op.fill === INK ? (op.color ?? style.stroke) : (op.fill ?? "transparent"),
          strokeWidth: op.strokeWidth,
          roundness: op.kind === "rect" && op.rounded ? { type: 3 } : null,
          ...(op.kind === "rect" && op.dashed ? { strokeStyle: "dashed" } : {}),
        });
        ids.push(
          op.kind === "rect"
            ? ea.addRect(op.x, op.y, op.w, op.h)
            : ea.addEllipse(op.x, op.y, op.w, op.h),
        );
        break;
      case "line":
        setStyle(ea, style, {
          strokeWidth: op.strokeWidth,
          ...(op.color ? { strokeColor: op.color } : {}),
        });
        ids.push(ea.addLine(op.points.map((p) => [p[0], p[1]])));
        break;
      case "text":
        setStyle(ea, style, {
          ...(op.color ? { strokeColor: op.color } : {}),
          ...(op.fontSize ? { fontSize: op.fontSize } : {}),
        });
        ids.push(ea.addText(op.x, op.y, op.text));
        break;
    }
  }
  return ids;
}
