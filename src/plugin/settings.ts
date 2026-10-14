import { DEFAULT_THEME, FONT_SIZE } from "../core";
import type { Style, Theme } from "../core";

// No Obsidian imports here, so settings can be tested in Node. The settings
// tab is in settingsTab.ts.

export interface Settings {
  colors: Theme["colors"];
  gap: Theme["gap"];
  fontSize: number;
  /** Take stroke colour, font and roughness from the drawing; otherwise use `fixed`. */
  useCanvasStyle: boolean;
  fixed: { stroke: string; fontFamily: number; roughness: number };
  /** Draw pasted text that parses without errors. Fenced blocks are drawn regardless. */
  pastePlainSpecs: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  colors: { ...DEFAULT_THEME.colors },
  gap: { ...DEFAULT_THEME.gap },
  fontSize: FONT_SIZE,
  useCanvasStyle: true,
  fixed: { stroke: "#1e1e1e", fontFamily: 5, roughness: 1 },
  pastePlainSpecs: true,
};

export const LIMITS = {
  fontSize: { min: 8, max: 72 },
  gap: { min: 0, max: 200 },
  roughness: { min: 0, max: 2 },
};

export function isColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function color(value: unknown, fallback: string): string {
  return isColor(value) ? value.toLowerCase() : fallback;
}

function number(value: unknown, fallback: number, limits: { min: number; max: number }): number {
  if (typeof value !== "number" || !isFinite(value)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, value));
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** Turns whatever is in data.json into valid settings; anything missing or invalid gets its default. */
export function normalizeSettings(data: unknown): Settings {
  const d = record(data);
  const colors = record(d.colors);
  const gap = record(d.gap);
  const fixed = record(d.fixed);
  const def = DEFAULT_SETTINGS;
  return {
    colors: {
      fill: color(colors.fill, def.colors.fill),
      primary: color(colors.primary, def.colors.primary),
      selected: color(colors.selected, def.colors.selected),
      paper: color(colors.paper, def.colors.paper),
      disabled: color(colors.disabled, def.colors.disabled),
      muted: color(colors.muted, def.colors.muted),
      dark: color(colors.dark, def.colors.dark),
      onDark: color(colors.onDark, def.colors.onDark),
      stripe: color(colors.stripe, def.colors.stripe),
    },
    gap: {
      root: number(gap.root, def.gap.root, LIMITS.gap),
      stack: number(gap.stack, def.gap.stack, LIMITS.gap),
      row: number(gap.row, def.gap.row, LIMITS.gap),
      pad: number(gap.pad, def.gap.pad, LIMITS.gap),
    },
    fontSize: number(d.fontSize, def.fontSize, LIMITS.fontSize),
    useCanvasStyle: typeof d.useCanvasStyle === "boolean" ? d.useCanvasStyle : def.useCanvasStyle,
    fixed: {
      stroke: color(fixed.stroke, def.fixed.stroke),
      fontFamily:
        typeof fixed.fontFamily === "number" && Number.isInteger(fixed.fontFamily)
          ? fixed.fontFamily
          : def.fixed.fontFamily,
      roughness: number(fixed.roughness, def.fixed.roughness, LIMITS.roughness),
    },
    pastePlainSpecs:
      typeof d.pastePlainSpecs === "boolean" ? d.pastePlainSpecs : def.pastePlainSpecs,
  };
}

export function themeOf(settings: Settings): Theme {
  return { colors: { ...settings.colors }, gap: { ...settings.gap } };
}

/** The style to draw with, given the style read from the canvas. */
export function styleOf(settings: Settings, canvas: Style): Style {
  return {
    ...(settings.useCanvasStyle ? canvas : settings.fixed),
    fontSize: settings.fontSize,
  };
}
