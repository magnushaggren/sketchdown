import { INK } from "./theme";
import type { DrawContext, Point } from "./types";

// Built-in icons, drawn with lines and ellipses so they get the canvas's
// hand-drawn look. Each one draws into a square of side s at (x, y), using
// coordinates from 0 to 1 within that square.

type Draw = (pen: Pen) => void;

interface Pen {
  line(...points: [number, number][]): void;
  circle(cx: number, cy: number, r: number, filled?: boolean): void;
  oval(cx: number, cy: number, rx: number, ry: number): void;
}

/** Points on an elliptic arc, angles in degrees, clockwise from the right (y points down). */
function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps = 10,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  return pts;
}

/** An arrowhead at the end of a clockwise arc of radius r around (cx, cy), at angle a. */
function arcArrow(p: Pen, cx: number, cy: number, r: number, a: number): void {
  const rad = (a * Math.PI) / 180;
  const tip: [number, number] = [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  const d = [-Math.sin(rad), Math.cos(rad)]; // direction of travel
  const n = [d[1], -d[0]];
  const back = [tip[0] - 0.2 * d[0], tip[1] - 0.2 * d[1]];
  p.line([back[0] + 0.14 * n[0], back[1] + 0.14 * n[1]], tip, [
    back[0] - 0.14 * n[0],
    back[1] - 0.14 * n[1],
  ]);
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
  "chevron-left": (p) => p.line([0.65, 0.2], [0.35, 0.5], [0.65, 0.8]),
  "chevron-up": (p) => p.line([0.2, 0.65], [0.5, 0.35], [0.8, 0.65]),
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
  key: (p) => {
    p.circle(0.27, 0.5, 0.17);
    p.line([0.44, 0.5], [0.92, 0.5]);
    p.line([0.72, 0.5], [0.72, 0.66]);
    p.line([0.86, 0.5], [0.86, 0.62]);
  },
  warning: (p) => {
    p.line([0.5, 0.1], [0.92, 0.86], [0.08, 0.86], [0.5, 0.1]);
    p.line([0.5, 0.38], [0.5, 0.6]);
    p.circle(0.5, 0.73, 0.04, true);
  },
  refresh: (p) => {
    p.line(...arc(0.5, 0.52, 0.34, 0.34, -30, 250, 14));
    arcArrow(p, 0.5, 0.52, 0.34, 250);
  },
  print: (p) => {
    p.line([0.08, 0.38], [0.92, 0.38], [0.92, 0.74], [0.08, 0.74], [0.08, 0.38]);
    p.line([0.26, 0.38], [0.26, 0.1], [0.74, 0.1], [0.74, 0.38]);
    p.line([0.26, 0.6], [0.26, 0.9], [0.74, 0.9], [0.74, 0.6], [0.26, 0.6]);
  },
  database: (p) => {
    p.oval(0.5, 0.2, 0.36, 0.11);
    p.line([0.14, 0.2], [0.14, 0.8]);
    p.line([0.86, 0.2], [0.86, 0.8]);
    p.line(...arc(0.5, 0.5, 0.36, 0.11, 0, 180));
    p.line(...arc(0.5, 0.8, 0.36, 0.11, 0, 180));
  },
  clock: (p) => {
    p.circle(0.5, 0.5, 0.42);
    p.line([0.5, 0.24], [0.5, 0.5], [0.7, 0.62]);
  },
  code: (p) => {
    p.line([0.3, 0.26], [0.08, 0.5], [0.3, 0.74]);
    p.line([0.7, 0.26], [0.92, 0.5], [0.7, 0.74]);
    p.line([0.58, 0.16], [0.42, 0.84]);
  },
  ban: (p) => {
    p.circle(0.5, 0.5, 0.42);
    p.line([0.2, 0.2], [0.8, 0.8]);
  },
  cloud: (p) =>
    p.line(
      ...arc(0.27, 0.6, 0.15, 0.15, 90, 250, 6),
      ...arc(0.5, 0.46, 0.22, 0.22, 200, 340, 8),
      ...arc(0.74, 0.6, 0.15, 0.15, 270, 450, 6),
      [0.27, 0.75],
    ),
  map: (p) => {
    p.line(
      [0.08, 0.2],
      [0.36, 0.1],
      [0.64, 0.2],
      [0.92, 0.1],
      [0.92, 0.8],
      [0.64, 0.9],
      [0.36, 0.8],
      [0.08, 0.9],
      [0.08, 0.2],
    );
    p.line([0.36, 0.1], [0.36, 0.8]);
    p.line([0.64, 0.2], [0.64, 0.9]);
  },
  hash: (p) => {
    p.line([0.4, 0.1], [0.32, 0.9]);
    p.line([0.72, 0.1], [0.64, 0.9]);
    p.line([0.14, 0.36], [0.9, 0.36]);
    p.line([0.1, 0.64], [0.86, 0.64]);
  },
  network: (p) => {
    p.circle(0.5, 0.2, 0.12);
    p.circle(0.2, 0.8, 0.12);
    p.circle(0.8, 0.8, 0.12);
    p.line([0.5, 0.32], [0.5, 0.52]);
    p.line([0.2, 0.68], [0.2, 0.52], [0.8, 0.52], [0.8, 0.68]);
  },
  grid: (p) => {
    p.line([0.12, 0.12], [0.88, 0.12], [0.88, 0.88], [0.12, 0.88], [0.12, 0.12]);
    p.line([0.37, 0.12], [0.37, 0.88]);
    p.line([0.63, 0.12], [0.63, 0.88]);
    p.line([0.12, 0.37], [0.88, 0.37]);
    p.line([0.12, 0.63], [0.88, 0.63]);
  },
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
    oval: (cx, cy, rx, ry) =>
      ctx.ellipse(x + (cx - rx) * s, y + (cy - ry) * s, 2 * rx * s, 2 * ry * s),
  });
}
