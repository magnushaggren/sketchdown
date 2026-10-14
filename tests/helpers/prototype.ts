import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { SpecNode } from "../../src/core";

// Loads the core of the Phase 1 script straight from prototype/Sketchdown.md,
// so the port can be compared against the code that is known to work.

const START = "// ===== SKETCHDOWN CORE START =====";
const END = "// ===== SKETCHDOWN CORE END =====";

export interface PrototypeCanvasStyle {
  stroke: string;
  fontFamily: number;
  roughness: number;
}

export interface PrototypeCore {
  /** The prototype reports errors as "line N: message" strings. */
  parse(source: string): { tree: SpecNode; errors: string[] };
  build(ea: unknown, tree: SpecNode, x: number, y: number, st: PrototypeCanvasStyle): string[];
  EXAMPLE: string;
  KEY: string;
  VERSION: number;
}

function load(): PrototypeCore {
  const path = fileURLToPath(new URL("../../prototype/Sketchdown.md", import.meta.url));
  const file = readFileSync(path, "utf8");
  const from = file.indexOf(START);
  const to = file.indexOf(END);
  if (from < 0 || to < from) throw new Error("core markers not found in prototype/Sketchdown.md");
  const code = file.slice(from, to);
  return new Function(
    `${code}\nreturn { parse, build, EXAMPLE, KEY, VERSION };`,
  )() as PrototypeCore;
}

export const prototype = load();
