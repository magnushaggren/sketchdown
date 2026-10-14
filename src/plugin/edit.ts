import { eaMeasure, renderOps } from "../adapters/excalidraw";
import type { EaElement, ExcalidrawAutomate } from "../adapters/ea-types";
import { EXAMPLE, KEY, VERSION } from "../constants";
import { FONT_SIZE, formatError, layout, parse } from "../core";
import type { LayoutEnv, Style } from "../core";
import { DEFAULT_SETTINGS, styleOf, themeOf } from "./settings";
import type { Settings } from "./settings";

export interface SketchdownTag {
  source: string;
  instance: string;
  v: number;
}

/** What the flow needs from the host, kept out of this file so it runs in tests. */
export interface EditHost {
  /**
   * Resolves to the edited spec, or null if the user cancelled.
   * pickSnippet asks for the snippet palette to be open from the start.
   */
  prompt(initial: string, placeholder: string, pickSnippet: boolean): Promise<string | null>;
  notify(message: string): void;
}

export function getTag(el: EaElement): SketchdownTag | undefined {
  const tag = el.customData?.[KEY] as Partial<SketchdownTag> | undefined;
  return tag?.source ? (tag as SketchdownTag) : undefined;
}

export function canvasStyle(ea: ExcalidrawAutomate): Style {
  const app = ea.getExcalidrawAPI().getAppState();
  return {
    stroke: (app.currentItemStrokeColor as string) || "#1e1e1e",
    fontFamily: (app.currentItemFontFamily as number) || 1,
    roughness: (app.currentItemRoughness as number) ?? 1,
    fontSize: FONT_SIZE,
  };
}

/** Everything layout and the adapters need to draw on this canvas with these settings. */
export function drawEnv(
  ea: ExcalidrawAutomate,
  settings: Settings,
): { style: Style; env: LayoutEnv } {
  const style = styleOf(settings, canvasStyle(ea));
  return { style, env: { measure: eaMeasure(ea), style, theme: themeOf(settings) } };
}

function newInstanceId(): string {
  return "sd-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * The single command, with the prototype's three flows:
 * 1. a selected Sketchdown component -> edit its spec and redraw it in place;
 * 2. a single selected text element -> convert it;
 * 3. nothing usable selected -> prompt, and place the result mid-view.
 *
 * In "insert" mode the editor opens on the snippet palette, and a new
 * component starts empty instead of with the example.
 */
export async function createOrEdit(
  ea: ExcalidrawAutomate,
  host: EditHost,
  mode: "edit" | "insert" = "edit",
  settings: Settings = DEFAULT_SETTINGS,
): Promise<void> {
  const selected = ea.getViewSelectedElements();
  const all = ea.getViewElements();
  let source = "";
  let pos: { x: number; y: number } | null = null;
  let toDelete: EaElement[] = [];
  let askUser = true;

  const tagged = selected.find((el) => getTag(el));
  const texts = selected.filter((el) => el.type === "text");

  if (tagged) {
    // edit an existing component
    const tag = getTag(tagged)!;
    // A duplicated component keeps its instance id but gets new group ids,
    // so the group tells the copies apart.
    const group = tagged.groupIds?.[0];
    toDelete = all.filter(
      (el) => getTag(el)?.instance === tag.instance && el.groupIds?.[0] === group,
    );
    source = tag.source;
    const bb = ea.getBoundingBox(toDelete);
    pos = { x: bb.topX, y: bb.topY };
  } else if (
    mode === "edit" &&
    texts.length === 1 &&
    selected.every((el) => el === texts[0] || el.id === texts[0].containerId)
  ) {
    // convert a text element written on the canvas
    const t = texts[0];
    source = t.rawText ?? t.originalText ?? t.text ?? "";
    toDelete = selected;
    const bb = ea.getBoundingBox(selected);
    pos = { x: bb.topX, y: bb.topY };
    askUser = false;
  }

  if (askUser) {
    const insert = mode === "insert";
    const value = await host.prompt(source || (insert ? "" : EXAMPLE), EXAMPLE, insert);
    if (value === null || !value.trim()) return;
    source = value;
  }

  await drawSpec(ea, source, pos, { settings, notify: host.notify, replace: toDelete });
}

export interface DrawOptions {
  settings?: Settings;
  /** Receives parse errors as one message. */
  notify?(message: string): void;
  /** Elements to delete once the new ones are added, i.e. the old version. */
  replace?: EaElement[];
}

/**
 * Draws a spec with its top-left at pos, or around the middle of the view
 * if pos is null. Tags, groups and selects the result. Returns false if
 * there was nothing to draw.
 */
export async function drawSpec(
  ea: ExcalidrawAutomate,
  source: string,
  pos: { x: number; y: number } | null,
  options: DrawOptions = {},
): Promise<boolean> {
  const { settings = DEFAULT_SETTINGS, notify, replace = [] } = options;
  const { style, env } = drawEnv(ea, settings);
  const { tree, errors } = parse(source);
  if (errors.length) notify?.(errors.map(formatError).join("\n"));
  if (!tree.children.length) return false;

  if (!pos) {
    const c = ea.getViewCenterPosition() || { x: 0, y: 0 };
    pos = { x: c.x - 200, y: c.y - 150 };
  }

  const { ops } = layout(tree, pos, env);
  const ids = renderOps(ea, ops, style);
  const tag: SketchdownTag = { source, instance: newInstanceId(), v: VERSION };
  ids.forEach((id) => ea.addAppendUpdateCustomData(id, { [KEY]: tag }));
  const groupId = ea.addToGroup(ids);

  if (replace.length) ea.deleteViewElements(replace);
  await ea.addElementsToView(false, true, true);
  ea.selectElementsInView(ids);
  // Select the group as well, or Excalidraw outlines every element separately.
  // Leave group editing, which may point at the deleted old version.
  ea.getExcalidrawAPI().updateScene({
    appState: { selectedGroupIds: { [groupId]: true }, editingGroupId: null },
  });
  return true;
}
