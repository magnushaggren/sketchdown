import { ItemView, Notice, Plugin } from "obsidian";
import "../adapters/ea-types";
import type { ExcalidrawAutomate } from "../adapters/ea-types";
import { renderSvg } from "../adapters/svg";
import {
  EXCALIDRAW_PLUGIN_ID,
  EXCALIDRAW_VIEW_TYPE,
  MIN_EXCALIDRAW_VERSION,
  PLUGIN_NAME,
} from "../constants";
import { layout, parse } from "../core";
import { createOrEdit, drawEnv, drawSpec } from "./edit";
import { editActions, installPasteHook, specFromPaste } from "./hooks";
import { promptForSpec } from "./modal";
import type { Preview } from "./modal";
import { normalizeSettings } from "./settings";
import type { Settings } from "./settings";
import { SketchdownSettingTab } from "./settingsTab";

/** An Excalidraw view, with the internals the toolbar button needs. */
type ExcalidrawView = ItemView & { selectedElementActionsMenu?: object | null };

interface ToolbarRegistration {
  view: ExcalidrawView;
  /** The view recreates its menu when it loads another drawing. */
  menu: object;
  ea: ExcalidrawAutomate;
}

export default class SketchdownPlugin extends Plugin {
  settings!: Settings;
  private toolbars: ToolbarRegistration[] = [];

  async onload(): Promise<void> {
    this.settings = normalizeSettings(await this.loadData());
    this.addSettingTab(new SketchdownSettingTab(this.app, this));
    this.addCommand({
      id: "create-or-edit",
      name: "Create or edit wireframe",
      checkCallback: (checking) => {
        const view = this.activeExcalidrawView();
        if (!view) return false;
        if (!checking) void this.run(view, "edit");
        return true;
      },
    });
    this.addCommand({
      id: "insert-component",
      name: "Insert component",
      checkCallback: (checking) => {
        const view = this.activeExcalidrawView();
        if (!view) return false;
        if (!checking) void this.run(view, "insert");
        return true;
      },
    });

    this.app.workspace.onLayoutReady(() => {
      if (!this.excalidrawLoaded()) return;
      this.register(
        installPasteHook(window.ExcalidrawAutomate!, (data) => {
          const source = specFromPaste(data, this.settings);
          if (source === null || !data.view) return false;
          void this.paste(data.view as unknown as ItemView, source, data.pointerPosition ?? null);
          return true;
        }),
      );
      this.attachToolbars();
      // drawings open and reload at any time; the check is cheap
      this.registerEvent(this.app.workspace.on("layout-change", () => this.attachToolbars()));
      this.registerEvent(this.app.workspace.on("file-open", () => this.attachToolbars()));
      this.registerInterval(window.setInterval(() => this.attachToolbars(), 2000));
    });
  }

  onunload(): void {
    for (const t of this.toolbars) t.ea.destroy();
    this.toolbars = [];
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
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

  /** Adds the "Edit wireframe" toolbar button to every open drawing that lacks it. */
  private attachToolbars(): void {
    if (!this.excalidrawLoaded()) return;
    // drop registrations whose menu is gone; the menu took its buttons with it
    this.toolbars = this.toolbars.filter((t) => {
      if (t.view.selectedElementActionsMenu === t.menu) return true;
      t.ea.destroy();
      return false;
    });
    for (const leaf of this.app.workspace.getLeavesOfType(EXCALIDRAW_VIEW_TYPE)) {
      const view = leaf.view as ExcalidrawView;
      const menu = view.selectedElementActionsMenu;
      if (!menu || this.toolbars.some((t) => t.menu === menu)) continue;
      const ea = window.ExcalidrawAutomate!.getAPI(view);
      if (typeof ea.registerElementActionProvider !== "function") {
        ea.destroy(); // older Excalidraw: the hotkey is the way to edit
        return;
      }
      const ok = ea.registerElementActionProvider((el) =>
        editActions(el, () => void this.run(view, "edit")),
      );
      if (ok) this.toolbars.push({ view, menu, ea });
      else ea.destroy();
    }
  }

  private notify(message: string): void {
    new Notice(`${PLUGIN_NAME}:\n${message}`, 8000);
  }

  private prompt(
    ea: ExcalidrawAutomate,
    initial: string,
    placeholder: string,
    pickSnippet: boolean,
  ): Promise<string | null> {
    const { style, env } = drawEnv(ea, this.settings);
    const appState = ea.getExcalidrawAPI().getAppState();
    const render = (source: string): Preview => {
      const { tree, errors } = parse(source);
      const { ops } = layout(tree, { x: 0, y: 0 }, env);
      return { svg: ops.length ? renderSvg(ops, style) : "", errors };
    };
    return promptForSpec(this.app, {
      initial,
      placeholder,
      render,
      pickSnippet,
      background: (appState.viewBackgroundColor as string) || "#ffffff",
      dark: appState.theme === "dark",
    });
  }

  private async run(view: ItemView, mode: "edit" | "insert"): Promise<void> {
    await this.withEa(view, (ea) =>
      createOrEdit(
        ea,
        {
          prompt: (initial, placeholder, pickSnippet) =>
            this.prompt(ea, initial, placeholder, pickSnippet),
          notify: (message) => this.notify(message),
        },
        mode,
        this.settings,
      ),
    );
  }

  private async paste(
    view: ItemView,
    source: string,
    pos: { x: number; y: number } | null,
  ): Promise<void> {
    await this.withEa(view, (ea) =>
      drawSpec(ea, source, pos, { settings: this.settings, notify: (m) => this.notify(m) }),
    );
  }

  /** Runs fn with an ExcalidrawAutomate for the view, and reports failures. */
  private async withEa(
    view: ItemView,
    fn: (ea: ExcalidrawAutomate) => Promise<unknown>,
  ): Promise<void> {
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
      await fn(ea);
    } catch (e) {
      console.error(`${PLUGIN_NAME}:`, e);
      new Notice(`${PLUGIN_NAME} failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      ea.destroy();
    }
  }
}
