import type { BlockResult } from "./block";

/** Puts a rendered block on the page: the drawing, any errors, and a copy button. */
export function showBlock(el: HTMLElement, result: BlockResult, onCopy: () => void): void {
  el.empty();
  const block = el.createDiv({ cls: "sketchdown-block" });
  const svg = result.svg
    ? new DOMParser().parseFromString(result.svg, "image/svg+xml").documentElement
    : null;
  if (svg && svg.nodeName === "svg") {
    block
      .createDiv({ cls: "sketchdown-block-drawing" })
      .appendChild(document.importNode(svg, true));
  } else if (!result.errors.length) {
    block.createDiv({ cls: "sketchdown-block-note", text: "Empty wireframe" });
  }
  if (result.errors.length) {
    const list = block.createDiv({ cls: "sketchdown-block-errors" });
    for (const error of result.errors) {
      const item = list.createDiv({ cls: "sketchdown-block-error" });
      item.createSpan({ cls: "sketchdown-error-line", text: `Line ${error.line}` });
      item.createSpan({ text: error.message });
    }
  }
  if (result.svg) {
    const copy = block.createEl("button", {
      cls: "sketchdown-block-copy",
      text: "Copy for Excalidraw",
      attr: { "aria-label": "Copy as a sketchdown block, to paste into a drawing" },
    });
    copy.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // in live preview, a click would open the source
      onCopy();
    });
  }
}

/** Shown when drawing failed outright, so the note still shows something useful. */
export function showBlockFailure(el: HTMLElement, source: string, e: unknown): void {
  el.empty();
  const block = el.createDiv({ cls: "sketchdown-block" });
  block.createDiv({
    cls: "sketchdown-block-error",
    text: `Could not draw this wireframe: ${e instanceof Error ? e.message : String(e)}`,
  });
  block.createEl("pre").createEl("code", { text: source });
}
