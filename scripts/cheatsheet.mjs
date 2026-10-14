// Builds the README's syntax cheat sheet from the component table in
// docs/SYNTAX.md, so the two can't drift apart. Run `npm run cheatsheet` to
// rewrite the README; tests/readme.test.ts fails while they differ.

import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { URL, fileURLToPath } from "node:url";

export const START =
  "<!-- cheatsheet:start (generated from docs/SYNTAX.md by npm run cheatsheet) -->";
export const END = "<!-- cheatsheet:end -->";

/** A two-column table, keyword and example, from SYNTAX.md's component rows. */
export function cheatSheet(syntax) {
  const rows = syntax
    .split("\n")
    .filter((line) => /^\| `[a-z0-9]+`/.test(line))
    .map((line) => {
      // split on | that isn't escaped as \|
      const [keyword, example] = line
        .split(/(?<!\\)\|/)
        .slice(1, 3)
        .map((cell) => cell.trim());
      return `| ${keyword.replace(/\s*\[[^\]]*\]$/, "")} | ${example} |`;
    });
  return ["| Keyword (aliases) | Example |", "|---|---|", ...rows].join("\n");
}

/** The README with its cheat sheet section replaced. */
export function withCheatSheet(readme, syntax) {
  const a = readme.indexOf(START);
  const b = readme.indexOf(END);
  if (a < 0 || b < a) throw new Error("README.md has no cheat sheet markers");
  return `${readme.slice(0, a)}${START}\n\n${cheatSheet(syntax)}\n\n${readme.slice(b)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL("..", import.meta.url);
  const readmePath = new URL("README.md", root);
  const syntax = readFileSync(new URL("docs/SYNTAX.md", root), "utf8");
  writeFileSync(readmePath, withCheatSheet(readFileSync(readmePath, "utf8"), syntax));
  console.log("cheatsheet: README.md updated");
}
