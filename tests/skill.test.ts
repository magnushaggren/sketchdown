import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain .mjs script without type declarations
import { CLI_OUT, SYNTAX_OUT, skillCli, skillSyntax } from "../scripts/skill.mjs";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("screenshot-to-sketchdown skill", () => {
  it("has a syntax reference without status markers or notes-only sections", () => {
    const syntax: string = skillSyntax(read("docs/SYNTAX.md"));
    expect(syntax).toContain("| `placeholder` |");
    expect(syntax).toContain("## Modifiers");
    expect(syntax).not.toMatch(/\[(v2|M3a|M3b|M6|planned)\]/);
    expect(syntax).not.toContain("## Wireframes in notes");
    expect(syntax).not.toContain("## Planned additions");
  });

  it("has an up-to-date syntax reference (run `npm run skill` to update it)", () => {
    expect(read(SYNTAX_OUT)).toBe(skillSyntax(read("docs/SYNTAX.md")));
  });

  it("has an up-to-date checker (run `npm run skill` to update it)", async () => {
    expect(read(CLI_OUT)).toBe(await skillCli());
  });

  it("describes itself in SKILL.md front matter", () => {
    const skill = read("skills/screenshot-to-sketchdown/SKILL.md");
    expect(skill).toMatch(/^---\nname: screenshot-to-sketchdown\ndescription: .+\n---\n/);
  });
});
