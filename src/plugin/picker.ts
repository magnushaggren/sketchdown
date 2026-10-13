import { App, SuggestModal } from "obsidian";
import { SNIPPETS } from "../core";
import type { Snippet } from "../core";

/** Quick-insert palette: pick a component and get its snippet. */
export class SnippetPicker extends SuggestModal<Snippet> {
  constructor(
    app: App,
    private readonly onPick: (snippet: Snippet) => void,
  ) {
    super(app);
    this.setPlaceholder("Insert a component…");
  }

  getSuggestions(query: string): Snippet[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return SNIPPETS.filter((s) => {
      const haystack = `${s.name} ${s.description} ${s.text}`.toLowerCase();
      return words.every((w) => haystack.includes(w));
    });
  }

  renderSuggestion(snippet: Snippet, el: HTMLElement): void {
    el.createDiv({ text: snippet.name });
    el.createEl("small", { cls: "sketchdown-snippet-note", text: snippet.description });
  }

  onChooseSuggestion(snippet: Snippet): void {
    this.onPick(snippet);
  }
}
