import { ItemView, MarkdownView, Notice, Plugin, debounce } from "obsidian";
import type { WorkspaceLeaf } from "obsidian";
import "../adapters/ea-types";
import { eaMeasure } from "../adapters/excalidraw";
import type {
  ExcalidrawAutomate,
  ExcalidrawAutomateGlobal,
  PasteHookData,
} from "../adapters/ea-types";
import { renderSvg } from "../adapters/svg";
import {
  EXCALIDRAW_PLUGIN_ID,
  EXCALIDRAW_VIEW_TYPE,
  MIN_EXCALIDRAW_VERSION,
  PLUGIN_NAME,
} from "../constants";
import { FENCE_KEYWORD, fenceSpec, layout, parse, specAtLine } from "../core";
import type { MeasureText } from "../core";
import { blockStyle, renderBlock } from "./block";
import { showBlock, showBlockFailure } from "./blockView";
import { createOrEdit, drawEnv, drawSpec } from "./edit";
import { editActions, installPasteHook, specFromPaste } from "./hooks";
import { domTextWidth, fontReady, textMeasurer } from "./measure";
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
  /** The Excalidraw API the paste hook is installed on, if any. */
  private pasteHookOn: ExcalidrawAutomateGlobal | null = null;
  /** The drawing used most recently, where "Send to Excalidraw" draws. */
  private lastDrawing: WorkspaceLeaf | null = null;

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

    this.registerMarkdownCodeBlockProcessor(FENCE_KEYWORD, async (source, el) => {
      if (!this.settings.renderBlocks) {
        el.createEl("pre").createEl("code", { text: source });
        return;
      }
      try {
        await fontReady(blockStyle(this.settings));
        showBlock(
          el,
          this.withMeasure((measure) => renderBlock(source, this.settings, measure)),
          () => void this.copyBlock(source),
        );
      } catch (e) {
        console.error(`${PLUGIN_NAME}:`, e);
        showBlockFailure(el, source, e);
      }
    });

    this.addCommand({
      id: "send-to-excalidraw",
      name: "Send wireframe to Excalidraw",
      editorCheckCallback: (checking, editor) => {
        const spec = specAtLine(editor.getValue(), editor.getCursor().line);
        if (!spec) return false;
        if (!checking) void this.send(spec);
        return true;
      },
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf?.view.getViewType() === EXCALIDRAW_VIEW_TYPE) this.lastDrawing = leaf;
      }),
    );

    this.app.workspace.onLayoutReady(() => {
      // Excalidraw may be enabled after this plugin, so keep checking:
      // drawings also open and reload at any time, and the check is cheap
      this.connectExcalidraw();
      this.registerEvent(this.app.workspace.on("layout-change", () => this.connectExcalidraw()));
      this.registerEvent(this.app.workspace.on("file-open", () => this.connectExcalidraw()));
      this.registerInterval(window.setInterval(() => this.connectExcalidraw(), 2000));
    });
  }

  onunload(): void {
    for (const t of this.toolbars) t.unregister();
    this.toolbars = [];
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.rerenderNotes();
  }

  /** Redraws code blocks in open notes; live preview catches up on the next edit. */
  private rerenderNotes = debounce(
    () => {
      for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
        if (leaf.view instanceof MarkdownView) leaf.view.previewMode.rerender(true);
      }
    },
    400,
    true,
  );

  private activeExcalidrawView(): ItemView | null {
    const view = this.app.workspace.getActiveViewOfType(ItemView);
    return view && view.getViewType() === EXCALIDRAW_VIEW_TYPE ? view : null;
  }

  private excalidrawLoaded(): boolean {
    const plugins = (this.app as unknown as { plugins?: { plugins?: Record<string, unknown> } })
      .plugins;
    return !!plugins?.plugins?.[EXCALIDRAW_PLUGIN_ID] && !!window.ExcalidrawAutomate;
  }

  /**
   * Installs the paste hook once Excalidraw is there, and adds toolbar
   * buttons to drawings that lack one. Safe to call repeatedly.
   */
  private connectExcalidraw(): void {
    if (!this.excalidrawLoaded()) return;
    const hookServer = window.ExcalidrawAutomate!;
    if (this.pasteHookOn !== hookServer) {
      // a new instance after Excalidraw was reloaded; the old one went with it
      this.pasteHookOn = hookServer;
      this.register(
        installPasteHook(hookServer, (data) => {
          // Excalidraw also sees pastes into other inputs, such as our editor
          if (this.busy || !pastedOnCanvas(data)) return false;
          const source = specFromPaste(data, this.settings);
          if (source === null || !data.view) return false;
          void this.paste(data.view as unknown as ItemView, source, data.pointerPosition ?? null);
          return true;
        }),
      );
    }
    this.attachToolbars();
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

  /**
   * Text measuring for notes: Excalidraw's own when it is there, so a block
   * lays out as the same spec would on a canvas; otherwise a canvas measurer.
   */
  private withMeasure<T>(fn: (measure: MeasureText) => T): T {
    if (!this.excalidrawLoaded()) return fn(textMeasurer(domTextWidth));
    const ea = window.ExcalidrawAutomate!.getAPI();
    try {
      return fn(eaMeasure(ea));
    } finally {
      ea.destroy();
    }
  }

  private async copyBlock(source: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(fenceSpec(source));
      new Notice(`${PLUGIN_NAME}: copied. Paste it into a drawing to draw it there.`);
    } catch (e) {
      new Notice(`${PLUGIN_NAME}: could not copy: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /** Draws a spec in the drawing used most recently, in the middle of its view. */
  private async send(spec: string): Promise<void> {
    const drawings = this.app.workspace.getLeavesOfType(EXCALIDRAW_VIEW_TYPE);
    const leaf =
      this.lastDrawing && drawings.includes(this.lastDrawing) ? this.lastDrawing : drawings[0];
    if (!leaf) {
      new Notice(`${PLUGIN_NAME}: open a drawing first, then send the wireframe again.`);
      return;
    }
    // a drawing in a background tab may not be loaded until it is shown
    await this.app.workspace.revealLeaf(leaf);
    if (!(leaf.view instanceof ItemView) || leaf.view.getViewType() !== EXCALIDRAW_VIEW_TYPE) {
      new Notice(`${PLUGIN_NAME}: the drawing isn't ready yet; try again.`);
      return;
    }
    await this.paste(leaf.view, spec, null);
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
