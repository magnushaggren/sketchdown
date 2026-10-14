import { ItemView, Notice, Plugin } from "obsidian";
import "../adapters/ea-types";
import type { ExcalidrawAutomate, PasteHookData } from "../adapters/ea-types";
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
  /**
   * Removes the button. Destroying the EA does not: Excalidraw only ties
   * providers to the EA's lifetime for scripts, so a plugin must remove its
   * own, or the button outlives a plugin reload.
   */
  unregister: () => void;
}

export default class SketchdownPlugin extends Plugin {
  settings!: Settings;
  private toolbars: ToolbarRegistration[] = [];
  /** True while an editor is open or a wireframe is being drawn. */
  private busy = false;

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
          // Excalidraw also sees pastes into other inputs, such as our editor
          if (this.busy || !pastedOnCanvas(data)) return false;
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
    for (const t of this.toolbars) t.unregister();
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
    this.toolbars = this.toolbars.filter((t) => t.view.selectedElementActionsMenu === t.menu);
    for (const leaf of this.app.workspace.getLeavesOfType(EXCALIDRAW_VIEW_TYPE)) {
      const view = leaf.view as ExcalidrawView;
      const menu = view.selectedElementActionsMenu;
      if (!menu || this.toolbars.some((t) => t.menu === menu)) continue;
      const ea = window.ExcalidrawAutomate!.getAPI(view);
      if (typeof ea.registerElementActionProvider !== "function") {
        ea.destroy(); // older Excalidraw: the hotkey is the way to edit
        return;
      }
      const unregister = ea.registerElementActionProvider((el) =>
        editActions(el, () => void this.run(view, "edit")),
      );
      ea.destroy(); // the provider doesn't need the EA after registering
      if (unregister) this.toolbars.push({ view, menu, unregister });
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

  /**
   * Runs fn with an ExcalidrawAutomate for the view, and reports failures.
   * One at a time: a second edit started while an editor is open would
   * draw a copy, because the first one has already replaced the original.
   */
  private async withEa(
    view: ItemView,
    fn: (ea: ExcalidrawAutomate) => Promise<unknown>,
  ): Promise<void> {
    if (this.busy) {
      new Notice(`${PLUGIN_NAME}: finish the open wireframe editor first.`);
      return;
    }
    if (!this.excalidrawLoaded()) {
      new Notice(`${PLUGIN_NAME} needs the Excalidraw plugin to be installed and enabled.`);
      return;
    }
    const ea = window.ExcalidrawAutomate!.getAPI(view);
    this.busy = true;
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
      this.busy = false;
      ea.destroy();
    }
  }
}

/** False when the paste went into a text field outside the drawing, e.g. our editor. */
function pastedOnCanvas(data: PasteHookData): boolean {
  const target = data.event?.target;
  const container = (data.view as { containerEl?: HTMLElement } | null | undefined)?.containerEl;
  if (!(target instanceof HTMLElement) || !container || container.contains(target)) return true;
  const editable =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable;
  return !editable;
}
