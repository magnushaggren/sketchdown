import { describe, expect, it } from "vitest";
import { EXAMPLE, KEY, VERSION } from "../src/constants";
import { canvasStyle, createOrEdit, getTag } from "../src/plugin/edit";
import type { EditHost } from "../src/plugin/edit";
import { FakeEa } from "./helpers/fakeEa";
import type { FakeElement } from "./helpers/fakeEa";

function host(answer: string | null | ((initial: string) => string | null)) {
  const prompts: { initial: string; placeholder: string }[] = [];
  const notices: string[] = [];
  const h: EditHost = {
    prompt: async (initial, placeholder) => {
      prompts.push({ initial, placeholder });
      return typeof answer === "function" ? answer(initial) : answer;
    },
    notify: (message) => notices.push(message),
  };
  return { h, prompts, notices };
}

const topLeft = (els: FakeElement[]) => ({
  x: Math.min(...els.map((e) => e.x)),
  y: Math.min(...els.map((e) => e.y)),
});

function canvasText(ea: FakeEa, text: string, x: number, y: number): FakeElement {
  const el: FakeElement = {
    id: `text-${ea.view.length}`,
    type: "text",
    text,
    rawText: text,
    x,
    y,
    w: 50,
    h: 20,
  };
  ea.view.push(el);
  return el;
}

describe("nothing selected", () => {
  it("prompts with the example and places the result relative to the view centre", async () => {
    const ea = new FakeEa();
    ea.center = { x: 1000, y: 800 };
    const { h, prompts } = host("button: Save");
    await createOrEdit(ea, h);

    expect(prompts).toEqual([{ initial: EXAMPLE, placeholder: EXAMPLE }]);
    expect(ea.view).toHaveLength(2);
    expect(topLeft(ea.view)).toEqual({ x: 800, y: 650 });
  });

  it("tags, groups and selects everything it draws", async () => {
    const ea = new FakeEa();
    await createOrEdit(ea, host(EXAMPLE).h);

    const tags = ea.view.map((el) => getTag(el));
    expect(new Set(tags.map((t) => t?.instance)).size).toBe(1);
    expect(tags[0]).toEqual({
      source: EXAMPLE,
      instance: expect.stringMatching(/^sd-/),
      v: VERSION,
    });
    expect(ea.view.map((el) => el.groupIds)).toEqual(ea.view.map(() => ["group-1"]));
    expect(ea.selection).toEqual(ea.view.map((el) => el.id));
    expect(ea.selectedGroupIds).toEqual({ "group-1": true });
  });

  it.each([null, "", "   \n "])("draws nothing when the prompt returns %j", async (answer) => {
    const ea = new FakeEa();
    await createOrEdit(ea, host(answer).h);
    expect(ea.view).toEqual([]);
    expect(ea.calls).toEqual([]);
  });

  it("reports errors and still draws the rest", async () => {
    const ea = new FakeEa();
    const { h, notices } = host("nonsense\nbutton: A");
    await createOrEdit(ea, h);
    expect(notices).toEqual([`line 1: don't understand "nonsense"`]);
    expect(ea.view).toHaveLength(2);
  });

  it("draws nothing when no component could be parsed", async () => {
    const ea = new FakeEa();
    const { h, notices } = host("nonsense");
    await createOrEdit(ea, h);
    expect(notices).toHaveLength(1);
    expect(ea.view).toEqual([]);
  });

  it("falls back to the origin when the view has no centre", async () => {
    const ea = new FakeEa();
    ea.center = null;
    await createOrEdit(ea, host("button: A").h);
    expect(topLeft(ea.view)).toEqual({ x: -200, y: -150 });
  });
});

describe("a single text element selected", () => {
  it("converts it in place without prompting", async () => {
    const ea = new FakeEa();
    const other = canvasText(ea, "keep me", 0, 0);
    const spec = canvasText(ea, "box: Login\n  button: *Sign in", 300, 120);
    ea.selection = [spec.id];
    const { h, prompts } = host(null);
    await createOrEdit(ea, h);

    expect(prompts).toEqual([]);
    expect(ea.view).toContain(other);
    expect(ea.view).not.toContain(spec);
    const drawn = ea.view.filter((el) => getTag(el));
    expect(drawn.length).toBeGreaterThan(0);
    expect(topLeft(drawn)).toEqual({ x: 300, y: 120 });
    expect(getTag(drawn[0])?.source).toBe("box: Login\n  button: *Sign in");
  });

  it("prefers rawText over the wrapped text", async () => {
    const ea = new FakeEa();
    const spec = canvasText(ea, "button: wrapped\nlabel", 0, 0);
    spec.rawText = "button: wrapped label";
    ea.selection = [spec.id];
    await createOrEdit(ea, host(null).h);
    expect(getTag(ea.view[0])?.source).toBe("button: wrapped label");
  });

  it("also replaces the text's container", async () => {
    const ea = new FakeEa();
    const container: FakeElement = { id: "c", type: "rectangle", x: 90, y: 40, w: 200, h: 100 };
    ea.view.push(container);
    const spec = canvasText(ea, "button: A", 100, 50);
    spec.containerId = "c";
    ea.selection = ["c", spec.id];
    await createOrEdit(ea, host(null).h);

    expect(ea.view.some((el) => el.id === "c" || el.id === spec.id)).toBe(false);
    expect(topLeft(ea.view)).toEqual({ x: 90, y: 40 });
  });

  it("prompts instead when other elements are selected too", async () => {
    const ea = new FakeEa();
    const a = canvasText(ea, "button: A", 0, 0);
    const b = canvasText(ea, "button: B", 0, 100);
    ea.selection = [a.id, b.id];
    const { h, prompts } = host(null);
    await createOrEdit(ea, h);
    expect(prompts).toHaveLength(1);
    expect(ea.view).toEqual([a, b]);
  });
});

describe("a Sketchdown component selected", () => {
  async function drawn(source: string, center = { x: 500, y: 400 }) {
    const ea = new FakeEa();
    ea.center = center;
    await createOrEdit(ea, host(source).h);
    return ea;
  }

  it("offers its stored source for editing", async () => {
    const ea = await drawn("button: Old");
    ea.selection = [ea.view[1].id];
    const { h, prompts } = host(null);
    await createOrEdit(ea, h);
    expect(prompts).toEqual([{ initial: "button: Old", placeholder: EXAMPLE }]);
  });

  it("redraws the whole instance at the same top-left, even if one element is selected", async () => {
    const ea = await drawn(EXAMPLE);
    const before = topLeft(ea.view);
    const oldIds = ea.view.map((el) => el.id);
    const oldInstance = getTag(ea.view[0])!.instance;
    ea.selection = [ea.view[3].id];
    const next = "box: A much wider replacement\n  button: One\n  button: Two";
    await createOrEdit(ea, host(next).h);

    expect(ea.view.some((el) => oldIds.includes(el.id))).toBe(false);
    expect(topLeft(ea.view)).toEqual(before);
    const tag = getTag(ea.view[0])!;
    expect(tag.source).toBe(next);
    expect(tag.instance).not.toBe(oldInstance);
    expect(ea.selection).toEqual(ea.view.map((el) => el.id));
  });

  it("edits only the selected copy of a duplicated component", async () => {
    const ea = await drawn(EXAMPLE);
    const original = [...ea.view];
    const copy = ea.duplicate(original, 600, 40);
    const copyAt = topLeft(copy);
    ea.selection = [copy[2].id];
    await createOrEdit(ea, host("button: Edited copy").h);

    expect(ea.view).toEqual(expect.arrayContaining(original));
    expect(ea.view.some((el) => copy.includes(el))).toBe(false);
    const redrawn = ea.view.filter((el) => !original.includes(el));
    expect(topLeft(redrawn)).toEqual(copyAt);
    expect(getTag(redrawn[0])?.source).toBe("button: Edited copy");
  });

  it("edits only the original when its duplicate is left alone", async () => {
    const ea = await drawn(EXAMPLE);
    const original = [...ea.view];
    const originalAt = topLeft(original);
    const copy = ea.duplicate(original, 600, 40);
    ea.selection = [original[0].id];
    await createOrEdit(ea, host("button: Edited original").h);

    expect(ea.view).toEqual(expect.arrayContaining(copy));
    expect(ea.view.some((el) => original.includes(el))).toBe(false);
    expect(topLeft(ea.view.filter((el) => !copy.includes(el)))).toEqual(originalAt);
  });

  it("keeps copies apart when they are grouped together", async () => {
    const ea = await drawn("button: A");
    const original = [...ea.view];
    const copy = ea.duplicate(original, 300, 0);
    [...original, ...copy].forEach((el) => el.groupIds!.push("outer"));
    ea.selection = [copy[0].id];
    await createOrEdit(ea, host("button: B").h);

    expect(ea.view).toEqual(expect.arrayContaining(original));
    expect(ea.view.some((el) => copy.includes(el))).toBe(false);
  });

  it("leaves other instances and plain elements alone", async () => {
    const ea = await drawn("button: First");
    const first = [...ea.view];
    const note = canvasText(ea, "a note", 2000, 2000);
    ea.selection = [];
    ea.center = { x: 0, y: 0 };
    await createOrEdit(ea, host("button: Second").h);
    const second = ea.view.filter((el) => !first.includes(el) && el !== note);

    ea.selection = [second[0].id];
    await createOrEdit(ea, host("button: Second, edited").h);
    expect(ea.view).toEqual(expect.arrayContaining([...first, note]));
    expect(ea.view.some((el) => second.includes(el))).toBe(false);
  });

  it("keeps the component when the edit is cancelled", async () => {
    const ea = await drawn("button: Keep");
    const before = [...ea.view];
    ea.selection = [ea.view[0].id];
    await createOrEdit(ea, host(null).h);
    expect(ea.view).toEqual(before);
  });

  it("takes precedence over a selected text element", async () => {
    const ea = await drawn("button: Tagged");
    const label = ea.view.find((el) => el.type === "text")!;
    ea.selection = [label.id];
    const { h, prompts } = host(null);
    await createOrEdit(ea, h);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].initial).toBe("button: Tagged");
  });
});

describe("stored data", () => {
  it("regenerates a component stored by the prototype (v2)", async () => {
    const ea = new FakeEa();
    const stored = { source: "button: From the prototype", instance: "sd-old1", v: 2 };
    ea.view.push(
      { id: "a", type: "rectangle", x: 40, y: 60, w: 100, h: 41, customData: { [KEY]: stored } },
      { id: "b", type: "text", x: 60, y: 70, w: 60, h: 21, customData: { [KEY]: stored } },
    );
    ea.selection = ["a"];
    await createOrEdit(ea, host((initial) => initial).h);

    expect(ea.view.some((el) => el.id === "a" || el.id === "b")).toBe(false);
    expect(topLeft(ea.view)).toEqual({ x: 40, y: 60 });
    expect(getTag(ea.view[0])).toMatchObject({ source: stored.source, v: 2 });
  });

  it("ignores elements whose tag has no source", () => {
    expect(
      getTag({ id: "x", type: "text", customData: { [KEY]: { instance: "i" } } }),
    ).toBeUndefined();
    expect(getTag({ id: "x", type: "text", customData: { other: 1 } })).toBeUndefined();
    expect(getTag({ id: "x", type: "text" })).toBeUndefined();
  });
});

describe("canvas style", () => {
  it("reads stroke, font and roughness from appState", () => {
    const ea = new FakeEa();
    ea.appState = {
      currentItemStrokeColor: "#e03131",
      currentItemFontFamily: 5,
      currentItemRoughness: 0,
    };
    expect(canvasStyle(ea)).toEqual({
      stroke: "#e03131",
      fontFamily: 5,
      roughness: 0,
      fontSize: 16,
    });
  });

  it("falls back to the prototype's defaults", () => {
    expect(canvasStyle(new FakeEa())).toEqual({
      stroke: "#1e1e1e",
      fontFamily: 1,
      roughness: 1,
      fontSize: 16,
    });
  });

  it("is used for the drawn elements", async () => {
    const ea = new FakeEa();
    ea.appState = {
      currentItemStrokeColor: "#e03131",
      currentItemFontFamily: 5,
      currentItemRoughness: 0,
    };
    await createOrEdit(ea, host("button: A").h);
    expect(ea.calls[0].style).toMatchObject({ strokeColor: "#e03131", roughness: 0 });
    expect(ea.calls[1].style).toMatchObject({
      strokeColor: "#e03131",
      fontFamily: 5,
      fontSize: 16,
    });
  });
});

describe("insert mode", () => {
  function pickHost(answer: string | null) {
    const prompts: { initial: string; pickSnippet: boolean }[] = [];
    const h: EditHost = {
      prompt: async (initial, _placeholder, pickSnippet) => {
        prompts.push({ initial, pickSnippet });
        return answer;
      },
      notify: () => {},
    };
    return { h, prompts };
  }

  it("opens an empty editor on the snippet palette", async () => {
    const ea = new FakeEa();
    const { h, prompts } = pickHost("button: A");
    await createOrEdit(ea, h, "insert");
    expect(prompts).toEqual([{ initial: "", pickSnippet: true }]);
    expect(ea.view).toHaveLength(2);
  });

  it("keeps the source of a selected component", async () => {
    const ea = new FakeEa();
    await createOrEdit(ea, host("button: Old").h);
    ea.selection = [ea.view[0].id];
    const { h, prompts } = pickHost(null);
    await createOrEdit(ea, h, "insert");
    expect(prompts).toEqual([{ initial: "button: Old", pickSnippet: true }]);
  });

  it("does not convert a selected text element", async () => {
    const ea = new FakeEa();
    const text = canvasText(ea, "button: A", 0, 0);
    ea.selection = [text.id];
    const { h, prompts } = pickHost(null);
    await createOrEdit(ea, h, "insert");
    expect(prompts).toHaveLength(1);
    expect(ea.view).toEqual([text]);
  });

  it("is off for the main command", async () => {
    const { h, prompts } = pickHost(null);
    await createOrEdit(new FakeEa(), h);
    expect(prompts).toEqual([{ initial: EXAMPLE, pickSnippet: false }]);
  });
});
