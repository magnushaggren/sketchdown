// Builds the generated parts of skills/screenshot-to-sketchdown: the syntax
// reference (from docs/SYNTAX.md) and the bundled checker (from src/cli).
// Run `npm run skill`; tests/skill.test.ts fails while they are out of date.

import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";

const root = new URL("..", import.meta.url);
export const SKILL_DIR = "skills/screenshot-to-sketchdown";
export const SYNTAX_OUT = `${SKILL_DIR}/reference/syntax.md`;
export const CLI_OUT = `${SKILL_DIR}/scripts/sketch.mjs`;

// sections that don't help when writing a spec
const DROP = ["Wireframes in notes", "Pasting onto the canvas", "Planned additions"];

/** SYNTAX.md without status markers and the sections in DROP. */
export function skillSyntax(syntax) {
  const sections = syntax.split(/^(?=## )/m);
  const kept = sections.filter((s) => !DROP.some((name) => s.startsWith(`## ${name}`)));
  return (
    "<!-- Generated from docs/SYNTAX.md by npm run skill. Do not edit. -->\n\n" +
    kept
      .join("")
      .replace(/^Status markers:.*\n\n/m, "")
      .replace(/\*\*\[(v2|M\d+[ab]?|planned)\]\*\* ?/g, "")
      .replace(/ \[(v2|M\d+[ab]?|planned)\]/g, "")
      .trimEnd() +
    "\n"
  );
}

/** The checker as one self-contained ES module. */
export async function skillCli() {
  const result = await build({
    entryPoints: [fileURLToPath(new URL("src/cli/bin.ts", root))],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
    legalComments: "inline",
    banner: {
      js:
        "// Sketchdown spec checker, generated from src/cli by npm run skill. Do not edit.\n" +
        "// Usage: node sketch.mjs spec.txt out.svg out.png (PNG needs Chrome or Edge)\n" +
        "// Includes Rough.js (MIT), https://roughjs.com",
    },
    logLevel: "error",
  });
  return result.outputFiles[0].text;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const syntax = readFileSync(new URL("docs/SYNTAX.md", root), "utf8");
  writeFileSync(new URL(SYNTAX_OUT, root), skillSyntax(syntax));
  writeFileSync(new URL(CLI_OUT, root), await skillCli());
  console.log(`skill: wrote ${SYNTAX_OUT} and ${CLI_OUT}`);
}
