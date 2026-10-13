import type { Theme } from "./types";

export const FONT_SIZE = 16;

export const DEFAULT_THEME: Theme = {
  colors: {
    fill: "#e9ecef", // neutral component fill
    primary: "#a5d8ff", // primary button
    selected: "#d0ebff", // selected grid row
    paper: "#ffffff", // inside of inputs and checkboxes
  },
  gap: { root: 24, stack: 14, row: 12, pad: 16 },
};
