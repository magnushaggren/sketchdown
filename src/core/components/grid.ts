import type { Component, Size } from "../types";
import { BOX, checkMark, contentLines, parseCheck } from "./shared";

const NUMERIC = /^[-+]?[$€£]?\s?\d[\d\s.,:]*\s?(%|kr|sek|€|\$|£)?$/i;

interface Cell {
  label: string;
  check?: boolean;
  checked?: boolean;
  numeric?: boolean;
  m: Size;
}

export const grid: Component = (ctx, node, x, y) => {
  let rows = contentLines(node);
  if (!rows.length) rows = ["Column A, Column B", "Value, Value"];
  rows = rows.filter((r) => !/^\|?\s*:?-{2,}/.test(r)); // drop markdown |---| lines
  const usePipe = rows.some((r) => r.includes("|"));
  const parsed = rows.map((r) => {
    let s = r.trim();
    let selected = false;
    if (s.startsWith("*") && !s.startsWith("*|") && !s.startsWith("*,")) {
      selected = true;
      s = s.slice(1).trim();
    }
    if (usePipe) s = s.replace(/^\|/, "").replace(/\|$/, "");
    const cells = (usePipe ? s.split("|") : s.split(","))
      .map((t) => t.trim())
      .map((t): Cell => {
        const cb = parseCheck(t);
        if (cb) return { check: true, ...cb, m: ctx.measure(cb.label) };
        return { label: t, numeric: NUMERIC.test(t), m: ctx.measure(t) };
      });
    return { selected, cells };
  });
  const ncols = Math.max(...parsed.map((r) => r.cells.length));
  parsed.forEach((r) => {
    while (r.cells.length < ncols) r.cells.push({ label: "", m: ctx.measure("") });
  });

  const padX = 10,
    padY = 7,
    gap = 6;
  let textH = 0;
  const colW: number[] = new Array(ncols).fill(0);
  parsed.forEach((r) =>
    r.cells.forEach((cell, i) => {
      textH = Math.max(textH, cell.m.h);
      const w = cell.check ? BOX + (cell.label ? gap + cell.m.w : 0) : cell.m.w;
      colW[i] = Math.max(colW[i], w + 2 * padX);
    }),
  );
  const rowH = Math.max(textH, BOX) + 2 * padY;
  const W = colW.reduce((a, b) => a + b, 0);
  const H = rowH * parsed.length;
  if (ctx.dry) return { w: W, h: H };
  const colX = [x];
  colW.forEach((w, i) => colX.push(colX[i] + w));

  const { colors } = ctx.theme;
  ctx.rect(x, y, W, rowH, { fill: colors.fill, noStroke: true });
  parsed.forEach((r, ri) => {
    if (r.selected && ri > 0) {
      ctx.rect(x, y + ri * rowH, W, rowH, { fill: colors.selected, noStroke: true });
    }
  });
  ctx.rect(x, y, W, H, { width: 2 });
  for (let ri = 1; ri < parsed.length; ri++) {
    ctx.line(
      [
        [x, y + ri * rowH],
        [x + W, y + ri * rowH],
      ],
      ri === 1 ? 2 : 1,
    );
  }
  for (let ci = 1; ci < ncols; ci++) {
    ctx.line(
      [
        [colX[ci], y],
        [colX[ci], y + H],
      ],
      1,
    );
  }
  parsed.forEach((r, ri) =>
    r.cells.forEach((cell, ci) => {
      const cy = y + ri * rowH;
      const inner = colW[ci] - 2 * padX;
      if (cell.check) {
        const contentW = BOX + (cell.label ? gap + cell.m.w : 0);
        const bx = cell.label ? colX[ci] + padX : colX[ci] + padX + (inner - contentW) / 2;
        checkMark(ctx, bx, cy + (rowH - BOX) / 2, !!cell.checked);
        if (cell.label) ctx.text(bx + BOX + gap, cy + (rowH - cell.m.h) / 2, cell.label, cell.m);
      } else if (cell.label) {
        const tx = cell.numeric && ri > 0 ? colX[ci] + colW[ci] - padX - cell.m.w : colX[ci] + padX;
        ctx.text(tx, cy + (rowH - cell.m.h) / 2, cell.label, cell.m);
      }
    }),
  );
  return { w: W, h: H };
};
