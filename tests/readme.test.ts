import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain .mjs script without type declarations
import { cheatSheet, withCheatSheet } from "../scripts/cheatsheet.mjs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("README cheat sheet", () => {
  it("lists every component in SYNTAX.md, without status markers", () => {
    const sheet: string = cheatSheet(read("docs/SYNTAX.md"));
    expect(sheet).toContain("| `button` (btn) | `button: *Save` |");
    expect(sheet).toContain(
      "| `dropdown` (select, combo, combobox) | `dropdown: *Sweden \\| Norway` |",
    );
    expect(sheet).not.toMatch(/\[(v2|M3a|M3b)\]/);
  });

  it("is up to date in README.md (run `npm run cheatsheet` to update it)", () => {
    const readme = read("README.md");
    expect(withCheatSheet(readme, read("docs/SYNTAX.md"))).toBe(readme);
  });
});
