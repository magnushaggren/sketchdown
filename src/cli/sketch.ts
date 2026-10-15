// Command-line rendering of a spec, for checking specs outside Obsidian
// (for example by an LLM agent turning a screenshot into a wireframe).
// Run it with `npm run sketch -- spec.txt out.svg out.png`.

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { renderSvg } from "../adapters/svg";
import { FONT_SIZE, extractSpec, isIcon, layout, parse } from "../core";
import type { MeasureText, ParseError, RectOp, Size, SpecNode, Style } from "../core";

// Cascadia (3) is monospaced, so the drawing matches the fixed-width measurer.
const STYLE: Style = { stroke: "#1e1e1e", fontFamily: 3, roughness: 1, fontSize: FONT_SIZE };
const PADDING = 16;

/** Fixed-width text: 9 px per character and 21 px per line at size 16, scaled. */
export const monoMeasure: MeasureText = (text, style) => {
  const lines = text.split("\n");
  const scale = style.fontSize / 16;
  return {
    w: 9 * scale * Math.max(...lines.map((l) => l.length)),
    h: 21 * scale * lines.length,
  };
};

export interface Placeholder {
  line: number;
  name: string;
  w: number;
  h: number;
}

export interface SketchResult {
  svg: string;
  errors: ParseError[];
  /** Things that draw, but probably not as meant. */
  warnings: ParseError[];
  /** Size of the SVG, padding included. */
  size: Size;
  placeholders: Placeholder[];
}

/** {name} tokens that aren't icons; they are drawn as literal text. */
function unknownIcons(spec: string): ParseError[] {
  return spec
    .split("\n")
    .flatMap((line, i) =>
      [...line.matchAll(/\{([\w-]+)\}/g)]
        .filter((m) => !isIcon(m[1]))
        .map((m) => ({ line: i + 1, message: `${m[0]} is not an icon, so it is drawn as text` })),
    );
}

function placeholderNodes(node: SpecNode): SpecNode[] {
  const own = node.type === "placeholder" ? [node] : [];
  return own.concat(...node.children.map(placeholderNodes));
}

/** Parses and draws a spec, or the first sketchdown block in a text. */
export function sketch(text: string): SketchResult {
  const spec = extractSpec(text, { plain: false }) ?? text;
  const { tree, errors } = parse(spec);
  const { ops, size } = layout(tree, { x: 0, y: 0 }, { measure: monoMeasure, style: STYLE });
  const svg = renderSvg(ops, STYLE, { padding: PADDING }).replace(
    "<svg ",
    '<svg style="background:#ffffff" ',
  );
  // each placeholder draws exactly one dashed rectangle, in tree order
  const dashed = ops.filter((o): o is RectOp => o.kind === "rect" && !!o.dashed);
  const placeholders = placeholderNodes(tree).map((node, i) => ({
    line: node.line ?? 0,
    name: [node.text, ...node.body]
      .join(" ")
      .replace(/\d+\s*[x×]\s*\d+/, "")
      .trim(),
    w: Math.round(dashed[i]?.w ?? 0),
    h: Math.round(dashed[i]?.h ?? 0),
  }));
  const pad = 2 * PADDING;
  const warnings = unknownIcons(spec);
  return { svg, errors, warnings, size: { w: size.w + pad, h: size.h + pad }, placeholders };
}

export interface Args {
  input: string;
  svg: string[];
  png: string[];
}

const USAGE = "usage: sketch <spec file or -> [out.svg] [out.png] ...";

export function parseArgs(argv: string[]): Args {
  const [input, ...outputs] = argv;
  if (!input) throw new Error(USAGE);
  const svg: string[] = [],
    png: string[] = [];
  for (const out of outputs) {
    if (/\.svg$/i.test(out)) svg.push(out);
    else if (/\.png$/i.test(out)) png.push(out);
    else throw new Error(`${out}: outputs must end in .svg or .png\n${USAGE}`);
  }
  if (!outputs.length) svg.push(input.replace(/(\.[^./\\]*)?$/, ".svg"));
  return { input, svg, png };
}

/** A short plain-text summary for the terminal. */
export function report(result: SketchResult, written: string[]): string {
  const lines = [`size: ${Math.round(result.size.w)}x${Math.round(result.size.h)}`];
  if (!result.errors.length) lines.push("errors: none");
  for (const e of result.errors) lines.push(`error: line ${e.line}: ${e.message}`);
  for (const w of result.warnings) lines.push(`warning: line ${w.line}: ${w.message}`);
  for (const p of result.placeholders) {
    lines.push(`placeholder: line ${p.line}: ${p.name || "(no name)"} (${p.w}x${p.h})`);
  }
  for (const path of written) lines.push(`wrote ${path}`);
  return lines.join("\n");
}

const CHROME_PATHS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function findChrome(): string | null {
  const env = process.env.SKETCHDOWN_CHROME ?? process.env.CHROME_PATH;
  if (env) return env;
  return CHROME_PATHS.find((p) => existsSync(p)) ?? null;
}

/** Screenshots an SVG file with headless Chrome or Edge. */
function writePng(svgPath: string, pngPath: string, size: Size): void {
  const chrome = findChrome();
  if (!chrome)
    throw new Error("PNG output needs Chrome or Edge; set SKETCHDOWN_CHROME to its path");
  const run = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${Math.ceil(size.w)},${Math.ceil(size.h)}`,
    `--screenshot=${pngPath}`,
    pathToFileURL(svgPath).href,
  ]);
  if (run.status !== 0 || !existsSync(pngPath)) {
    throw new Error(`${chrome} failed to write ${pngPath}: ${run.stderr?.toString().trim()}`);
  }
}

/** Runs the command; returns the exit code (1 for parse errors, 2 for usage or I/O). */
export function main(argv: string[]): number {
  try {
    const args = parseArgs(argv);
    const text = readFileSync(args.input === "-" ? 0 : args.input, "utf8");
    const result = sketch(text);
    for (const path of args.svg) writeFileSync(path, result.svg + "\n");
    if (args.png.length) {
      const tmp = mkdtempSync(join(tmpdir(), "sketchdown-"));
      try {
        const svgPath = join(tmp, "sketch.svg");
        writeFileSync(svgPath, result.svg);
        for (const path of args.png) writePng(svgPath, path, result.size);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
    console.log(report(result, [...args.svg, ...args.png]));
    return result.errors.length ? 1 : 0;
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    return 2;
  }
}
