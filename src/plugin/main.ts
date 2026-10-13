import { ItemView, Notice, Plugin } from "obsidian";
import "../adapters/ea-types";
import {
  EXCALIDRAW_PLUGIN_ID,
  EXCALIDRAW_VIEW_TYPE,
  MIN_EXCALIDRAW_VERSION,
  PLUGIN_NAME,
} from "../constants";
import { createOrEdit } from "./edit";
import { promptForSpec } from "./modal";

export default class SketchdownPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: "create-or-edit",
      name: "Create or edit wireframe",
      checkCallback: (checking) => {
        const view = this.activeExcalidrawView();
        if (!view) return false;
        if (!checking) void this.run(view);
        return true;
      },
    });
  }

  private activeExcalidrawView(): ItemView | null {
    const view = this.app.workspace.getActiveViewOfType(ItemView);
    return view && view.getViewType() === EXCALIDRAW_VIEW_TYPE ? view : null;
  }

  private excalidrawLoaded(): boolean {
    const plugins = (this.app as unknown as { plugins?: { plugins?: Record<string, unknown> } })
      .plugins;
    return !!plugins?.plugins?.[EXCALIDRAW_PLUGIN_ID] && !!window.ExcalidrawAutomate;
  }

  private async run(view: ItemView): Promise<void> {
    if (!this.excalidrawLoaded()) {
      new Notice(`${PLUGIN_NAME} needs the Excalidraw plugin to be installed and enabled.`);
      return;
    }
    const ea = window.ExcalidrawAutomate!.getAPI(view);
    try {
      if (!ea.verifyMinimumPluginVersion?.(MIN_EXCALIDRAW_VERSION)) {
        new Notice(`${PLUGIN_NAME} needs Excalidraw plugin ${MIN_EXCALIDRAW_VERSION} or newer.`);
        return;
      }
      ea.setView(view);
      await createOrEdit(ea, {
        prompt: (initial, placeholder) => promptForSpec(this.app, initial, placeholder),
        notify: (message) => new Notice(`${PLUGIN_NAME}:\n${message}`, 8000),
      });
    } catch (e) {
      console.error(`${PLUGIN_NAME}:`, e);
      new Notice(`${PLUGIN_NAME} failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      ea.destroy();
    }
  }
}
