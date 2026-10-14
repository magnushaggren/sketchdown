import { describe, expect, it } from "vitest";
import { renderSvg } from "../src/adapters/svg";
import { FONT_SIZE, layout, parse } from "../src/core";
import type { Style } from "../src/core";
import { GALLERY } from "./fixtures/gallery";
import { fakeMeasure } from "./helpers/fakeMeasure";

// Visual regression check: the gallery is rendered to docs/gallery.svg, which
// is committed. Any change to what is drawn shows up as a diff of that file.
// Run `npm test -- -u` to accept a change. Text is measured with the
// fixed-width test measurer and drawn in a monospaced font.

// Cascadia (3) is monospaced, so the image matches the fixed-width measurer.
const style: Style = { stroke: "#1e1e1e", fontFamily: 3, roughness: 1, fontSize: FONT_SIZE };

describe("gallery", () => {
  it("parses without errors", () => {
    expect(parse(GALLERY).errors).toEqual([]);
  });

  it("matches docs/gallery.svg", async () => {
    const { ops } = layout(parse(GALLERY).tree, { x: 0, y: 0 }, { measure: fakeMeasure, style });
    const svg = renderSvg(ops, style, { padding: 16 }).replace(
      "<svg ",
      '<svg style="background:#ffffff" ',
    );
    await expect(svg + "\n").toMatchFileSnapshot("../docs/gallery.svg");
  });
});
