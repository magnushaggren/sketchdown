import type { Component, DrawContext } from "../types";
import { contentLines } from "./shared";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor " +
  "incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud " +
  "exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure " +
  "dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
const WIDTH = 320;
const LOREM_LINES = 4;

/** Greedy word wrap to the given width; a word longer than the width gets a line of its own. */
export function wrap(ctx: DrawContext, text: string, width: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measure(next).w > width) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}

/** Wrapped text in one element; "lorem" (or nothing) gives placeholder text. */
export const paragraph: Component = (ctx, node, x, y, slot) => {
  const W = Math.max(node.opts.w || 0, slot?.w || 0) || WIDTH;
  const given = contentLines(node).join(" ").trim();
  let lines: string[];
  if (!given || given.toLowerCase() === "lorem") {
    const want = node.opts.lines || LOREM_LINES;
    // repeat the placeholder until it fills the lines, however wide they are
    for (let copies = 1; ; copies *= 2) {
      lines = wrap(ctx, Array(copies).fill(LOREM).join(" "), W);
      if (lines.length > want || copies > 64) break;
    }
    lines = lines.slice(0, want);
  } else {
    lines = wrap(ctx, given, W);
    if (node.opts.lines) lines = lines.slice(0, node.opts.lines);
  }
  const str = lines.join("\n");
  const m = ctx.measure(str);
  ctx.text(x, y, str, m);
  return { w: W, h: m.h };
};
