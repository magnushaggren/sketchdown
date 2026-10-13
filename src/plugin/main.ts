import { ItemView, Notice, Plugin } from "obsidian";
import "../adapters/ea-types";
import type { ExcalidrawAutomate } from "../adapters/ea-types";
import { eaMeasure } from "../adapters/excalidraw";
import { renderSvg } from "../adapters/svg";
import {
  EXCALIDRAW_PLUGIN_ID,
  EXCALIDRAW_VIEW_TYPE,
  MIN_EXCALIDRAW_VERSION,
  PLUGIN_NAME,
} from "../constants";
import { layout, parse } from "../core";
import { canvasStyle, createOrEdit } from "./edit";
import { promptForSpec } from "./modal";
import type { Preview } from "./modal";

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

  private prompt(
    ea: ExcalidrawAutomate,
    initial: string,
    placeholder: string,
  ): Promise<string | null> {
    const style = canvasStyle(ea);
    const measure = eaMeasure(ea);
    const appState = ea.getExcalidrawAPI().getAppState();
    const render = (source: string): Preview => {
      const { tree, errors } = parse(source);
      const { ops } = layout(tree, { x: 0, y: 0 }, { measure, style });
      return { svg: ops.length ? renderSvg(ops, style) : "", errors };
    };
    return promptForSpec(this.app, {
      initial,
      placeholder,
      render,
      background: (appState.viewBackgroundColor as string) || "#ffffff",
      dark: appState.theme === "dark",
    });
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
        prompt: (initial, placeholder) => this.prompt(ea, initial, placeholder),
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
