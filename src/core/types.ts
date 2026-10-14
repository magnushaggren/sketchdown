// ---------- AST ----------
export type ComponentType =
  | "button"
  | "dropdown"
  | "checkbox"
  | "text"
  | "grid"
  | "tabs"
  | "box"
  | "row"
  | "icon"
  | "input"
  | "search"
  | "password"
  | "textarea"
  | "h1"
  | "h2"
  | "columns"
  | "nav"
  | "avatar"
  | "details"
  | "window"
  | "dialog"
  | "browser"
  | "phone"
  | "buttons"
  | "link"
  | "paragraph";
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
// roughness come from one Style and are applied by the adapter. An op's
// optional color (and a text op's fontSize) overrides the Style for that
// element; the keys are left out, not undefined, when not set.
export interface RectOp {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  /** Hex colour, INK for the stroke colour, or null for transparent. */
  fill: string | null;
  stroke: boolean;
  strokeWidth: 1 | 2;
  rounded: boolean;
  /** Stroke colour. */
  color?: string;
}
export interface LineOp {
  kind: "line";
  /** Absolute coordinates, consecutive duplicates removed. */
  points: Point[];
  strokeWidth: 1 | 2;
  color?: string;
}
export interface TextOp {
  kind: "text";
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  color?: string;
  fontSize?: number;
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
  color?: string;
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
  colors: {
    fill: string;
    primary: string;
    selected: string;
    paper: string;
    /** Stroke and text of (disabled) components. */
    disabled: string;
    /** Secondary text: detail values, placeholders. */
    muted: string;
    /** Background of (dark) panels. */
    dark: string;
    /** Text and lines on (dark) panels. */
    onDark: string;
    /** Every other row of a (striped) grid. */
    stripe: string;
    /** Text of [links]. */
    link: string;
  };
  gap: { root: number; stack: number; row: number; pad: number };
}

// ---------- component contract ----------
export interface RectOptions {
  fill?: string;
  noStroke?: boolean;
  width?: 1 | 2;
  rounded?: boolean;
  /** Stroke colour; defaults to the context's ink. */
  color?: string;
}

export interface TextOptions {
  /** Defaults to the context's ink. */
  color?: string;
  fontSize?: number;
}

/**
 * Room a parent gives a (fill) child. A component makes itself at least
 * this big where it can; missing sides mean "natural size".
 */
export interface Slot {
  w?: number;
  h?: number;
}

/**
 * What components draw through. In dry mode nothing is emitted, so a
 * component can be measured by drawing it (see size()).
 */
export interface DrawContext {
  readonly theme: Theme;
  dry: boolean;
  /** The base font size; headings scale from it. */
  readonly fontSize: number;
  /** Colour for strokes and text that don't name one; null means the Style's. */
  ink: string | null;
  measure(text: string, fontSize?: number): Size;
  rect(x: number, y: number, w: number, h: number, o?: RectOptions): void;
  /** Ellipse inside the box; o.rounded is ignored. */
  ellipse(x: number, y: number, w: number, h: number, o?: RectOptions): void;
  line(points: Point[], strokeWidth?: 1 | 2, color?: string): void;
  /** size is the measured size of str, which the caller already has. */
  text(x: number, y: number, str: string, size: Size, o?: TextOptions): void;
  draw(node: SpecNode, x: number, y: number, slot?: Slot): Size;
  size(node: SpecNode, slot?: Slot): Size;
  /**
   * Draws children top to bottom. (fill) children are as wide as width,
   * or as the widest child when width is not given.
   */
  stack(children: SpecNode[], x: number, y: number, gap: number, width?: number): Size;
}

export type Component = (
  ctx: DrawContext,
  node: SpecNode,
  x: number,
  y: number,
  slot?: Slot,
) => Size;
