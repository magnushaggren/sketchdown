// The subset of ExcalidrawAutomate that Sketchdown uses, declared by hand
// because the obsidian-excalidraw-plugin npm package is outdated.
// Checked against the plugin's src/shared/ExcalidrawAutomate.ts (v2.29.0).

export interface EaStyle {
  strokeColor: string;
  backgroundColor: string;
  angle: number;
  fillStyle: string;
  strokeWidth: number;
  strokeStyle: string;
  roughness: number;
  opacity: number;
  roundness: null | { type: number };
  fontFamily: number;
  fontSize: number;
  textAlign: string;
}

export interface EaElement {
  id: string;
  type: string;
  customData?: Record<string, unknown>;
  containerId?: string | null;
  /** Innermost group first. */
  groupIds?: string[];
  text?: string;
  rawText?: string;
  originalText?: string;
}

export interface EaBoundingBox {
  topX: number;
  topY: number;
  width: number;
  height: number;
}

export interface PasteHookData {
  payload?: {
    text?: string;
    elements?: readonly unknown[];
    files?: Record<string, unknown> | null;
  } | null;
  event?: ClipboardEvent | null;
  /** The ExcalidrawView; modifierKeyDown is the view's own key tracking. */
  view?: { modifierKeyDown?: { shiftKey?: boolean } } | null;
  /** Scene coordinates of the pointer. */
  pointerPosition?: { x: number; y: number } | null;
}

/** Return false to stop Excalidraw's own paste. */
export type PasteHook = (data: PasteHookData) => boolean;

export interface ElementAction {
  id: string;
  title: string;
  /** A Lucide icon name. */
  icon: string;
  action: () => void;
}

export interface ExcalidrawAutomate {
  style: EaStyle;
  /** Hook slot; only used on the global instance, which views call by default. */
  onPasteHook?: PasteHook | null;
  /**
   * Adds buttons to the toolbar above a single selected element of the
   * target view. Removed when this instance is destroyed or the view's
   * scene unmounts. Missing in older plugin versions.
   */
  registerElementActionProvider?(
    getActions: (element: EaElement) => readonly ElementAction[],
  ): (() => void) | null;
  setView(view?: unknown, show?: boolean): unknown;
  destroy(): void;
  verifyMinimumPluginVersion?(requiredVersion: string): boolean;
  getExcalidrawAPI(): {
    getAppState(): Record<string, unknown>;
    updateScene(scene: { appState?: Record<string, unknown> }): void;
  };
  getViewSelectedElements(): EaElement[];
  getViewElements(): EaElement[];
  getBoundingBox(elements: EaElement[]): EaBoundingBox;
  getViewCenterPosition(): { x: number; y: number } | null | undefined;
  deleteViewElements(elements: EaElement[]): boolean;
  measureText(text: string): { width: number; height: number };
  addRect(topX: number, topY: number, width: number, height: number): string;
  addEllipse(topX: number, topY: number, width: number, height: number): string;
  /** Points are absolute canvas coordinates. */
  addLine(points: number[][]): string;
  addText(topX: number, topY: number, text: string): string;
  addToGroup(ids: string[]): string;
  addAppendUpdateCustomData(id: string, data: Record<string, unknown>): unknown;
  addElementsToView(
    repositionToCursor?: boolean,
    save?: boolean,
    newElementsOnTop?: boolean,
  ): Promise<boolean>;
  selectElementsInView(elements: EaElement[] | string[]): void;
}

export interface ExcalidrawAutomateGlobal {
  getAPI(view?: unknown): ExcalidrawAutomate;
  /** Views call the hooks of this instance unless a script registered its own. */
  onPasteHook?: PasteHook | null;
}

declare global {
  interface Window {
    ExcalidrawAutomate?: ExcalidrawAutomateGlobal;
  }
}
