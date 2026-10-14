import type { Theme } from "./types";

export const FONT_SIZE = 16;

export const DEFAULT_THEME: Theme = {
  colors: {
    fill: "#e9ecef", // neutral component fill
    primary: "#a5d8ff", // primary button
    selected: "#d0ebff", // selected grid row
    paper: "#ffffff", // inside of inputs and checkboxes
    disabled: "#adb5bd", // stroke and text of (disabled) components
    muted: "#868e96", // secondary text
    dark: "#343a40", // background of (dark) panels
    onDark: "#f8f9fa", // text and lines on (dark) panels
    stripe: "#f1f3f5", // every other row of a (striped) grid
    link: "#1971c2", // [links] in labels and link:
  },
  gap: { root: 24, stack: 14, row: 12, pad: 16 },
};

/** A fill that means "the stroke colour", for solid dots and icons. */
export const INK = "ink";
