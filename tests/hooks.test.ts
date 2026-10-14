import { describe, expect, it } from "vitest";
import type { PasteHook, PasteHookData } from "../src/adapters/ea-types";
import { KEY } from "../src/constants";
import { editActions, installPasteHook, specFromPaste } from "../src/plugin/hooks";
import { DEFAULT_SETTINGS, normalizeSettings } from "../src/plugin/settings";

const paste = (text: string, extra: Partial<PasteHookData> = {}): PasteHookData => ({
  payload: { text },
  pointerPosition: { x: 10, y: 20 },
  ...extra,
});

describe("specFromPaste", () => {
  it("takes a plain spec and a fenced block", () => {
    expect(specFromPaste(paste("button: *Save"), DEFAULT_SETTINGS)).toBe("button: *Save");
    expect(specFromPaste(paste("```sketchdown\nbutton: A\n```"), DEFAULT_SETTINGS)).toBe(
      "button: A",
    );
  });

  it("only takes fenced blocks when plain specs are switched off", () => {
    const off = { ...DEFAULT_SETTINGS, pastePlainSpecs: false };
    expect(specFromPaste(paste("button: *Save"), off)).toBeNull();
    expect(specFromPaste(paste("```sketchdown\nbutton: A\n```"), off)).toBe("button: A");
  });

  it("leaves ordinary text, copied elements and images alone", () => {
    expect(specFromPaste(paste("Hello world"), DEFAULT_SETTINGS)).toBeNull();
    expect(specFromPaste({ payload: { elements: [{}] } }, DEFAULT_SETTINGS)).toBeNull();
    expect(
      specFromPaste({ payload: { text: "button: A", elements: [{}] } }, DEFAULT_SETTINGS),
    ).toBeNull();
    expect(
      specFromPaste({ payload: { text: "button: A", files: { f: {} } } }, DEFAULT_SETTINGS),
    ).toBeNull();
    expect(specFromPaste({ payload: null }, DEFAULT_SETTINGS)).toBeNull();
    expect(specFromPaste({}, DEFAULT_SETTINGS)).toBeNull();
  });

  it("leaves a paste with Shift held as plain text", () => {
    const view = { modifierKeyDown: { shiftKey: true } };
    expect(specFromPaste(paste("button: A", { view }), DEFAULT_SETTINGS)).toBeNull();
  });
});

describe("installPasteHook", () => {
  const data = paste("x");

  it("stops Excalidraw's paste when the handler takes it", () => {
    const slot: { onPasteHook?: PasteHook | null } = {};
    installPasteHook(slot, () => true);
    expect(slot.onPasteHook!(data)).toBe(false);
  });

  it("lets Excalidraw paste when the handler doesn't take it and there was no hook", () => {
    const slot: { onPasteHook?: PasteHook | null } = {};
    installPasteHook(slot, () => false);
    expect(slot.onPasteHook!(data)).toBe(true);
  });

  it("passes pastes it doesn't take to the hook that was there before", () => {
    const seen: PasteHookData[] = [];
    const previous: PasteHook = (d) => (seen.push(d), false);
    const slot = { onPasteHook: previous };
    installPasteHook(slot, () => false);
    expect(slot.onPasteHook(data)).toBe(false);
    expect(seen).toEqual([data]);
  });

  it("does not call the previous hook for pastes it takes", () => {
    let called = false;
    const slot = { onPasteHook: (() => ((called = true), true)) as PasteHook };
    installPasteHook(slot, () => true);
    slot.onPasteHook(data);
    expect(called).toBe(false);
  });

  it("puts the previous hook back when removed", () => {
    const previous: PasteHook = () => true;
    const slot = { onPasteHook: previous };
    const remove = installPasteHook(slot, () => true);
    remove();
    expect(slot.onPasteHook).toBe(previous);
  });

  it("stays in a script's chain after removal, but only passes pastes on", () => {
    const slot: { onPasteHook?: PasteHook | null } = { onPasteHook: null };
    const remove = installPasteHook(slot, () => true);
    const ours = slot.onPasteHook!;
    const script: PasteHook = (d) => ours(d);
    slot.onPasteHook = script;
    remove();
    expect(slot.onPasteHook).toBe(script);
    expect(script(data)).toBe(true);
  });
});

describe("editActions", () => {
  const tagged = {
    id: "a",
    type: "rectangle",
    customData: { [KEY]: { source: "button: A", instance: "sd-1", v: 2 } },
  };

  it("offers Edit wireframe for an element of a wireframe", () => {
    let edited = 0;
    const actions = editActions(tagged, () => edited++);
    expect(actions.map((a) => a.title)).toEqual(["Edit wireframe"]);
    actions[0].action();
    expect(edited).toBe(1);
  });

  it("offers nothing for other elements", () => {
    expect(editActions({ id: "b", type: "rectangle" }, () => {})).toEqual([]);
    expect(editActions({ id: "c", type: "text", customData: { other: 1 } }, () => {})).toEqual([]);
  });
});

describe("paste setting", () => {
  it("is on by default and kept when valid", () => {
    expect(normalizeSettings({}).pastePlainSpecs).toBe(true);
    expect(normalizeSettings({ pastePlainSpecs: false }).pastePlainSpecs).toBe(false);
    expect(normalizeSettings({ pastePlainSpecs: "no" }).pastePlainSpecs).toBe(true);
  });
});
