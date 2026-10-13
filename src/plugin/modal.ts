import { App, Modal } from "obsidian";
import { PLUGIN_NAME } from "../constants";
import type { ParseError } from "../core";
import { SnippetPicker } from "./picker";
import { indentEdit, lineRange, newlineEdit, snippetEdit } from "./textedit";
import type { TextEdit } from "./textedit";

export interface Preview {
  /** A standalone SVG document, or "" when there is nothing to draw. */
  svg: string;
  errors: ParseError[];
}

export interface SpecModalOptions {
  initial: string;
  placeholder: string;
  /** Draws the spec the way it will look on the canvas. */
  render(source: string): Preview;
  /** Canvas background colour, so the preview sits on the same paper. */
  background: string;
  /** Excalidraw inverts colours in dark mode; the preview does the same. */
  dark: boolean;
  /** Open the snippet palette straight away. */
  pickSnippet?: boolean;
}

const PREVIEW_DELAY_MS = 120;

/** Spec editor: text on the left, live preview on the right, errors below the text. */
export class SpecModal extends Modal {
  private result: string | null = null;
  private textarea!: HTMLTextAreaElement;
  private previewEl!: HTMLElement;
  private errorsEl!: HTMLElement;
  private timer: number | null = null;

  constructor(
    app: App,
    private readonly options: SpecModalOptions,
    private readonly onDone: (value: string | null) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.modalEl.addClass("sketchdown-modal");
    this.titleEl.setText(`${PLUGIN_NAME} – describe the UI`);

    const panes = this.contentEl.createDiv({ cls: "sketchdown-panes" });
    const left = panes.createDiv({ cls: "sketchdown-editor" });
    this.textarea = left.createEl("textarea", { cls: "sketchdown-spec" });
    this.textarea.placeholder = this.options.placeholder;
    this.textarea.value = this.options.initial;
    this.textarea.spellcheck = false;
    this.textarea.wrap = "off";
    this.errorsEl = left.createDiv({ cls: "sketchdown-errors" });

    this.previewEl = panes.createDiv({ cls: "sketchdown-preview" });
    this.previewEl.style.backgroundColor = this.options.background;
    this.previewEl.toggleClass("is-dark", this.options.dark);

    this.textarea.addEventListener("keydown", (e) => this.onKeydown(e));
    this.textarea.addEventListener("input", () => this.schedulePreview());

    const footer = this.contentEl.createDiv({ cls: "sketchdown-footer" });
    footer.createSpan({
      cls: "sketchdown-hint",
      text: "Ctrl/Cmd+Space to insert · Tab / Shift+Tab to indent · Ctrl/Cmd+Enter to apply",
    });
    const buttons = footer.createDiv({ cls: "modal-button-container" });
    buttons
      .createEl("button", { text: "Insert…" })
      .addEventListener("click", () => this.pickSnippet());
    buttons
      .createEl("button", { text: "Apply", cls: "mod-cta" })
      .addEventListener("click", () => this.apply());
    buttons.createEl("button", { text: "Cancel" }).addEventListener("click", () => this.close());

    this.updatePreview();
    this.textarea.focus();
    if (this.options.pickSnippet) this.pickSnippet();
  }

  onClose(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.contentEl.empty();
    this.onDone(this.result);
  }

  private apply(): void {
    this.result = this.textarea.value;
    this.close();
  }

  private pickSnippet(): void {
    new SnippetPicker(this.app, (snippet) => {
      const { value, selectionStart } = this.textarea;
      this.edit(snippetEdit(value, selectionStart, snippet.text));
    }).open();
  }

  private onKeydown(e: KeyboardEvent): void {
    if (e.isComposing) return;
    const { value, selectionStart, selectionEnd } = this.textarea;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.apply();
    } else if (e.key === " " && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.pickSnippet();
    } else if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      this.edit(indentEdit(value, selectionStart, selectionEnd, e.shiftKey));
    } else if (e.key === "Enter" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      this.edit(newlineEdit(value, selectionStart, selectionEnd));
    }
  }

  /** Applies an edit through the browser's editing commands, so undo keeps working. */
  private edit(e: TextEdit): void {
    const ta = this.textarea;
    if (e.from !== e.to || e.insert) {
      ta.focus();
      ta.setSelectionRange(e.from, e.to);
      const done = e.insert
        ? document.execCommand("insertText", false, e.insert)
        : document.execCommand("delete");
      if (!done) ta.setRangeText(e.insert, e.from, e.to, "end");
    }
    ta.setSelectionRange(e.selStart, e.selEnd);
    this.schedulePreview();
  }

  private schedulePreview(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.updatePreview();
    }, PREVIEW_DELAY_MS);
  }

  private updatePreview(): void {
    let preview: Preview;
    try {
      preview = this.options.render(this.textarea.value);
    } catch (e) {
      console.error(`${PLUGIN_NAME}:`, e);
      this.previewEl.empty();
      this.previewEl.createDiv({
        cls: "sketchdown-preview-empty",
        text: `Preview failed: ${e instanceof Error ? e.message : String(e)}`,
      });
      return;
    }

    this.previewEl.empty();
    const svg = preview.svg
      ? new DOMParser().parseFromString(preview.svg, "image/svg+xml").documentElement
      : null;
    if (svg && svg.nodeName === "svg") {
      this.previewEl.appendChild(document.importNode(svg, true));
    } else {
      this.previewEl.createDiv({ cls: "sketchdown-preview-empty", text: "Nothing to draw yet" });
    }

    this.errorsEl.empty();
    for (const error of preview.errors) {
      const item = this.errorsEl.createEl("button", { cls: "sketchdown-error" });
      item.createSpan({ cls: "sketchdown-error-line", text: `Line ${error.line}` });
      item.createSpan({ text: error.message });
      item.addEventListener("click", () => this.goToLine(error.line));
    }
  }

  private goToLine(line: number): void {
    const { from, to } = lineRange(this.textarea.value, line);
    this.textarea.focus();
    this.textarea.setSelectionRange(from, to);
    // a textarea doesn't scroll to a selection set from script
    const lineHeight = parseFloat(getComputedStyle(this.textarea).lineHeight) || 20;
    const top = (line - 1) * lineHeight;
    const { scrollTop, clientHeight } = this.textarea;
    if (top < scrollTop || top + lineHeight > scrollTop + clientHeight) {
      this.textarea.scrollTop = Math.max(0, top - clientHeight / 2);
    }
  }
}

export function promptForSpec(app: App, options: SpecModalOptions): Promise<string | null> {
  return new Promise((resolve) => new SpecModal(app, options, resolve).open());
}
