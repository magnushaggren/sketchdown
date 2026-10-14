import { INK } from "./theme";
import type { DrawContext, Point } from "./types";

// Built-in icons, drawn with lines and ellipses so they get the canvas's
// hand-drawn look. Each one draws into a square of side s at (x, y), using
// coordinates from 0 to 1 within that square.

type Draw = (pen: Pen) => void;

interface Pen {
  line(...points: [number, number][]): void;
  circle(cx: number, cy: number, r: number, filled?: boolean): void;
}

function star(): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 ? 0.2 : 0.45;
    pts.push([0.5 + r * Math.cos(a), 0.55 + r * Math.sin(a)]);
  }
  return pts;
}

function user(p: Pen, dx: number, scale: number): void {
  const at = (x: number, y: number): [number, number] => [dx + x * scale, 1 - (1 - y) * scale];
  p.circle(dx + 0.5 * scale, 1 - 0.72 * scale, 0.18 * scale);
  p.line(
    at(0.15, 0.92),
    at(0.2, 0.68),
    at(0.35, 0.58),
    at(0.65, 0.58),
    at(0.8, 0.68),
    at(0.85, 0.92),
  );
}

const DRAW: Record<string, Draw> = {
  search: (p) => {
    p.circle(0.42, 0.42, 0.28);
    p.line([0.63, 0.63], [0.9, 0.9]);
  },
  filter: (p) =>
    p.line(
      [0.1, 0.15],
      [0.9, 0.15],
      [0.58, 0.5],
      [0.58, 0.88],
      [0.42, 0.76],
      [0.42, 0.5],
      [0.1, 0.15],
    ),
  more: (p) => {
    p.circle(0.2, 0.5, 0.07, true);
    p.circle(0.5, 0.5, 0.07, true);
    p.circle(0.8, 0.5, 0.07, true);
  },
  close: (p) => {
    p.line([0.2, 0.2], [0.8, 0.8]);
    p.line([0.8, 0.2], [0.2, 0.8]);
  },
  back: (p) => {
    p.line([0.88, 0.5], [0.12, 0.5]);
    p.line([0.42, 0.2], [0.12, 0.5], [0.42, 0.8]);
  },
  menu: (p) => {
    p.line([0.12, 0.22], [0.88, 0.22]);
    p.line([0.12, 0.5], [0.88, 0.5]);
    p.line([0.12, 0.78], [0.88, 0.78]);
  },
  home: (p) => {
    p.line([0.08, 0.5], [0.5, 0.12], [0.92, 0.5]);
    p.line([0.22, 0.4], [0.22, 0.88], [0.78, 0.88], [0.78, 0.4]);
  },
  user: (p) => user(p, 0, 1),
  users: (p) => {
    user(p, 0.3, 0.7);
    user(p, 0, 0.8);
  },
  settings: (p) => {
    p.circle(0.5, 0.5, 0.15);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const c = Math.cos(a),
        s = Math.sin(a);
      p.line([0.5 + 0.28 * c, 0.5 + 0.28 * s], [0.5 + 0.44 * c, 0.5 + 0.44 * s]);
    }
    p.circle(0.5, 0.5, 0.3);
  },
  plus: (p) => {
    p.line([0.5, 0.12], [0.5, 0.88]);
    p.line([0.12, 0.5], [0.88, 0.5]);
  },
  edit: (p) => {
    p.line([0.15, 0.85], [0.2, 0.65], [0.7, 0.15], [0.85, 0.3], [0.35, 0.8], [0.15, 0.85]);
    p.line([0.6, 0.25], [0.75, 0.4]);
  },
  trash: (p) => {
    p.line([0.12, 0.25], [0.88, 0.25]);
    p.line([0.38, 0.25], [0.38, 0.12], [0.62, 0.12], [0.62, 0.25]);
    p.line([0.22, 0.25], [0.28, 0.9], [0.72, 0.9], [0.78, 0.25]);
  },
  bell: (p) => {
    p.line(
      [0.18, 0.75],
      [0.28, 0.62],
      [0.28, 0.4],
      [0.4, 0.2],
      [0.6, 0.2],
      [0.72, 0.4],
      [0.72, 0.62],
      [0.82, 0.75],
      [0.18, 0.75],
    );
    p.line([0.42, 0.88], [0.58, 0.88]);
  },
  calendar: (p) => {
    p.line([0.12, 0.2], [0.88, 0.2], [0.88, 0.9], [0.12, 0.9], [0.12, 0.2]);
    p.line([0.12, 0.42], [0.88, 0.42]);
    p.line([0.32, 0.08], [0.32, 0.28]);
    p.line([0.68, 0.08], [0.68, 0.28]);
  },
  file: (p) => {
    p.line([0.2, 0.08], [0.6, 0.08], [0.82, 0.3], [0.82, 0.92], [0.2, 0.92], [0.2, 0.08]);
    p.line([0.6, 0.08], [0.6, 0.3], [0.82, 0.3]);
  },
  folder: (p) =>
    p.line(
      [0.08, 0.22],
      [0.4, 0.22],
      [0.5, 0.34],
      [0.92, 0.34],
      [0.92, 0.86],
      [0.08, 0.86],
      [0.08, 0.22],
    ),
  star: (p) => p.line(...star()),
  info: (p) => {
    p.circle(0.5, 0.5, 0.42);
    p.line([0.5, 0.46], [0.5, 0.74]);
    p.circle(0.5, 0.3, 0.04, true);
  },
  check: (p) => p.line([0.12, 0.52], [0.4, 0.78], [0.88, 0.22]),
  "chevron-down": (p) => p.line([0.2, 0.35], [0.5, 0.65], [0.8, 0.35]),
  "chevron-right": (p) => p.line([0.35, 0.2], [0.65, 0.5], [0.35, 0.8]),
  mail: (p) => {
    p.line([0.08, 0.22], [0.92, 0.22], [0.92, 0.8], [0.08, 0.8], [0.08, 0.22]);
    p.line([0.08, 0.22], [0.5, 0.55], [0.92, 0.22]);
  },
  phone: (p) => {
    p.line([0.28, 0.06], [0.72, 0.06], [0.72, 0.94], [0.28, 0.94], [0.28, 0.06]);
    p.line([0.44, 0.82], [0.56, 0.82]);
  },
  lock: (p) => {
    p.line([0.18, 0.45], [0.82, 0.45], [0.82, 0.9], [0.18, 0.9], [0.18, 0.45]);
    p.line([0.32, 0.45], [0.32, 0.28], [0.42, 0.14], [0.58, 0.14], [0.68, 0.28], [0.68, 0.45]);
  },
  dot: (p) => p.circle(0.5, 0.5, 0.25, true),
};

export const ICON_NAMES: readonly string[] = Object.keys(DRAW);

export function isIcon(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(DRAW, name.toLowerCase());
}

/** Draws a known icon into the square of side s at (x, y). */
export function drawIcon(ctx: DrawContext, name: string, x: number, y: number, s: number): void {
  const at = (px: number, py: number): Point => [x + px * s, y + py * s];
  DRAW[name.toLowerCase()]({
    line: (...pts) => ctx.line(pts.map(([px, py]) => at(px, py))),
    circle: (cx, cy, r, filled) =>
      ctx.ellipse(x + (cx - r) * s, y + (cy - r) * s, 2 * r * s, 2 * r * s, {
        ...(filled ? { fill: INK } : {}),
      }),
  });
}
