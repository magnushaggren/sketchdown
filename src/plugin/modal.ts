import { App, Modal } from "obsidian";
import { PLUGIN_NAME } from "../constants";

/** Minimal spec prompt. M1 replaces this with the editor modal and live preview. */
export class SpecModal extends Modal {
  private result: string | null = null;

  constructor(
    app: App,
    private readonly initial: string,
    private readonly placeholder: string,
    private readonly onDone: (value: string | null) => void,
  ) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText(`${PLUGIN_NAME} – describe the UI (Ctrl/Cmd+Enter to apply)`);
    const textarea = this.contentEl.createEl("textarea", { cls: "sketchdown-spec" });
    textarea.rows = 14;
    textarea.placeholder = this.placeholder;
    textarea.value = this.initial;

    const apply = () => {
      this.result = textarea.value;
      this.close();
    };
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        apply();
      }
    });

    const buttons = this.contentEl.createDiv({ cls: "modal-button-container" });
    buttons.createEl("button", { text: "Apply", cls: "mod-cta" }).addEventListener("click", apply);
    buttons.createEl("button", { text: "Cancel" }).addEventListener("click", () => this.close());

    textarea.focus();
  }

  onClose(): void {
    this.contentEl.empty();
    this.onDone(this.result);
  }
}

export function promptForSpec(
  app: App,
  initial: string,
  placeholder: string,
): Promise<string | null> {
  return new Promise((resolve) => new SpecModal(app, initial, placeholder, resolve).open());
}
