// ---------- AST ----------
export type ComponentType =
  "button" | "dropdown" | "checkbox" | "text" | "grid" | "tabs" | "box" | "row";
export type NodeType = "root" | ComponentType;

export interface SpecNode {
  type: NodeType;
  /** Content after the colon, with options removed. */
  text: string;
  /** Continuation lines. */
  body: string[];
  children: SpecNode[];
  /** Numeric options from "(k=v, ...)", keys in lower case. */
  opts: Record<string, number>;
  /** 1-based source line; missing on the root. */
  line?: number;
}

export interface ParseError {
  /** 1-based source line. */
  line: number;
  message: string;
}

export interface ParseResult {
  tree: SpecNode;
  errors: ParseError[];
}

// ---------- geometry ----------
export interface Size {
  w: number;
  h: number;
}
export type Point = readonly [number, number];

// ---------- draw ops ----------
// Ops carry geometry and per-element paint only. Stroke colour, font and
// roughness come from one Style and are applied by the adapter.
export interface RectOp {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Hex colour, or null for transparent. */
  fill: string | null;
  stroke: boolean;
  strokeWidth: 1 | 2;
  rounded: boolean;
}
export interface LineOp {
  kind: "line";
  /** Absolute coordinates, consecutive duplicates removed. */
  points: Point[];
  strokeWidth: 1 | 2;
}
export interface TextOp {
  kind: "text";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}
export interface EllipseOp {
  kind: "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string | null;
  stroke: boolean;
  strokeWidth: 1 | 2;
}
export type DrawOp = RectOp | LineOp | TextOp | EllipseOp;

// ---------- style ----------
export interface TextStyle {
  fontSize: number;
  fontFamily: number;
}
/** Canvas-wide values, read from the drawing's appState. */
export interface Style extends TextStyle {
  stroke: string;
  roughness: number;
}
export type MeasureText = (text: string, style: TextStyle) => Size;

export interface Theme {
  colors: { fill: string; primary: string; selected: string; paper: string };
  gap: { root: number; stack: number; row: number; pad: number };
}

// ---------- component contract ----------
export interface RectOptions {
  fill?: string;
  noStroke?: boolean;
  width?: 1 | 2;
  rounded?: boolean;
}

/**
 * What components draw through. In dry mode nothing is emitted, so a
 * component can be measured by drawing it (see size()).
 */
export interface DrawContext {
  readonly theme: Theme;
  dry: boolean;
  measure(text: string): Size;
  rect(x: number, y: number, w: number, h: number, o?: RectOptions): void;
  line(points: Point[], strokeWidth?: 1 | 2): void;
  /** size is the measured size of str, which the caller already has. */
  text(x: number, y: number, str: string, size: Size): void;
  draw(node: SpecNode, x: number, y: number): Size;
  size(node: SpecNode): Size;
  stack(children: SpecNode[], x: number, y: number, gap: number): Size;
}

export type Component = (ctx: DrawContext, node: SpecNode, x: number, y: number) => Size;
