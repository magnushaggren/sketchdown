import { describe, expect, it } from "vitest";
import { parse } from "../src/core";
import { VALID_SPECS } from "./fixtures/specs";
import { prototype } from "./helpers/prototype";

// Backwards compatibility: sources written for the v2 prototype are stored in
// existing drawings and must keep parsing cleanly.

describe.each(Object.entries(VALID_SPECS))("v2 source: %s", (_name, source) => {
  it("parses without errors", () => {
    expect(prototype.parse(source).errors).toEqual([]);
    expect(parse(source).errors).toEqual([]);
  });
});
