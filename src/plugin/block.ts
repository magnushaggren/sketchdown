import { renderSvg } from "../adapters/svg";
import { layout, parse } from "../core";
import type { MeasureText, ParseError, Style } from "../core";
import { themeOf } from "./settings";
import type { Settings } from "./settings";

// Rendering of ```sketchdown blocks in notes. No Obsidian imports, so it
// runs in tests; the code block processor in main.ts puts the SVG on the page.

export interface BlockResult {
  /** A standalone SVG, or "" when there is nothing to draw. */
  svg: string;
  errors: ParseError[];
}

/** A note has no canvas to take a style from, so blocks use the fixed style. */
export function blockStyle(settings: Settings): Style {
  return { ...settings.fixed, fontSize: settings.fontSize };
}

export function renderBlock(source: string, settings: Settings, measure: MeasureText): BlockResult {
  const { tree, errors } = parse(source);
  const style = blockStyle(settings);
  const { ops } = layout(tree, { x: 0, y: 0 }, { measure, style, theme: themeOf(settings) });
  return { svg: ops.length ? renderSvg(ops, style) : "", errors };
}
