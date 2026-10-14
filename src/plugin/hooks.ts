import type { EaElement, ElementAction, PasteHook, PasteHookData } from "../adapters/ea-types";
import { extractSpec } from "../core";
import { getTag } from "./edit";
import type { Settings } from "./settings";

// Hooks into Excalidraw, without Obsidian imports so they run in tests.

/** The spec to draw for a paste, or null to let Excalidraw paste as usual. */
export function specFromPaste(data: PasteHookData, settings: Settings): string | null {
  const payload = data.payload;
  if (!payload?.text) return null;
  // copied Excalidraw elements and images keep their normal paste
  if (payload.elements?.length || (payload.files && Object.keys(payload.files).length)) return null;
  // Shift (Ctrl/Cmd+Shift+V) pastes as plain text
  if (data.view?.modifierKeyDown?.shiftKey) return null;
  return extractSpec(payload.text, { plain: settings.pastePlainSpecs });
}

/**
 * Puts a paste handler into the hook slot, which Excalidraw shares with
 * scripts. Pastes the handler doesn't take go to whatever hook was there
 * before. Returns a function that takes the handler out again.
 */
export function installPasteHook(
  target: { onPasteHook?: PasteHook | null },
  handle: (data: PasteHookData) => boolean,
): () => void {
  const previous = target.onPasteHook ?? null;
  let active = true;
  const hook: PasteHook = (data) => {
    if (active && handle(data)) return false;
    return previous ? previous(data) : true;
  };
  target.onPasteHook = hook;
  return () => {
    active = false;
    // if a script has put its own hook on top of ours, ours stays in its chain but does nothing
    if (target.onPasteHook === hook) target.onPasteHook = previous;
  };
}

/** The toolbar button shown above a selected element of a wireframe. */
export function editActions(element: EaElement, edit: () => void): ElementAction[] {
  return getTag(element)
    ? [{ id: "sketchdown-edit", title: "Edit wireframe", icon: "pencil", action: edit }]
    : [];
}
