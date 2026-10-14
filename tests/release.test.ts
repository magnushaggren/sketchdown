import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain .mjs script without type declarations
import { bump } from "../scripts/version-bump.mjs";

describe("version bump", () => {
  it("sets the manifest version and records it with the minimum app version", () => {
    const manifest = { id: "sketchdown", version: "0.1.0", minAppVersion: "1.5.0" };
    expect(bump(manifest, { "0.1.0": "1.5.0" }, "0.9.0")).toEqual({
      manifest: { ...manifest, version: "0.9.0" },
      versions: { "0.1.0": "1.5.0", "0.9.0": "1.5.0" },
    });
  });
});
