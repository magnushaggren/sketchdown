import type { Component } from "../types";
import { drawLabel, measureLabel } from "./label";
import { contentLines } from "./shared";

/** A line of link text: blue and underlined, icons allowed. */
export const link: Component = (ctx, node, x, y, slot) => {
  const label = measureLabel(ctx, contentLines(node).join(" ") || "Link");
  for (const part of label.parts) if (part.kind === "text" && !part.tone) part.tone = "link";
  drawLabel(ctx, x, y, label);
  return { w: Math.max(label.w, slot?.w || 0), h: label.h };
};
