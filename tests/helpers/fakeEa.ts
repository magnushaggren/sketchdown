import type {
  EaBoundingBox,
  EaElement,
  EaStyle,
  ExcalidrawAutomate,
} from "../../src/adapters/ea-types";
import { fakeTextSize } from "./fakeMeasure";

// The style fields that affect how each element type is drawn. The prototype
// leaves the others inherited from earlier calls, so only these are recorded.
const STYLE_FIELDS = {
  rect: [
    "strokeColor",
    "backgroundColor",
    "fillStyle",
    "strokeWidth",
    "strokeStyle",
    "roughness",
    "roundness",
    "opacity",
    "angle",
  ],
  ellipse: [
    "strokeColor",
    "backgroundColor",
    "fillStyle",
    "strokeWidth",
    "strokeStyle",
    "roughness",
    "opacity",
    "angle",
  ],
  line: ["strokeColor", "strokeWidth", "strokeStyle", "roughness", "roundness", "opacity", "angle"],
  text: ["strokeColor", "fontSize", "fontFamily", "textAlign", "opacity", "angle"],
} as const;

export interface FakeCall {
  id: string;
  kind: keyof typeof STYLE_FIELDS;
  args: unknown[];
  style: Record<string, unknown>;
}

export interface FakeElement extends EaElement {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Records what would be drawn, and keeps a tiny in-memory view for the edit flow. */
export class FakeEa implements ExcalidrawAutomate {
  style: EaStyle = {
    strokeColor: "#000000",
    backgroundColor: "transparent",
    angle: 0,
    fillStyle: "hachure",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    roundness: null,
    fontFamily: 1,
    fontSize: 20,
    textAlign: "left",
  };
  calls: FakeCall[] = [];
  workbench: FakeElement[] = [];
  view: FakeElement[] = [];
  selection: string[] = [];
  selectedGroupIds: Record<string, boolean> = {};
  appState: Record<string, unknown> = {};
  center: { x: number; y: number } | null = { x: 0, y: 0 };
  destroyed = false;
  private n = 0;
  private groups = 0;

  constructor(private readonly idPrefix = "el") {}

  private add(kind: FakeCall["kind"], args: unknown[], box: Omit<FakeElement, "id" | "type">) {
    const id = `${this.idPrefix}-${++this.n}`;
    const style: Record<string, unknown> = {};
    for (const f of STYLE_FIELDS[kind]) style[f] = structuredClone(this.style[f]);
    this.calls.push({ id, kind, args: structuredClone(args), style });
    this.workbench.push({ id, type: kind === "rect" ? "rectangle" : kind, ...box });
    return id;
  }

  setView(): unknown {
    return null;
  }
  destroy(): void {
    this.destroyed = true;
  }
  verifyMinimumPluginVersion(): boolean {
    return true;
  }
  getExcalidrawAPI() {
    return {
      getAppState: () => this.appState,
      updateScene: (scene: { appState?: Record<string, unknown> }) => {
        const groups = scene.appState?.selectedGroupIds;
        if (groups) this.selectedGroupIds = groups as Record<string, boolean>;
      },
    };
  }
  getViewSelectedElements(): EaElement[] {
    return this.view.filter((el) => this.selection.includes(el.id));
  }
  getViewElements(): EaElement[] {
    return [...this.view];
  }
  getBoundingBox(elements: EaElement[]): EaBoundingBox {
    const els = elements as FakeElement[];
    const topX = Math.min(...els.map((e) => e.x));
    const topY = Math.min(...els.map((e) => e.y));
    return {
      topX,
      topY,
      width: Math.max(...els.map((e) => e.x + e.w)) - topX,
      height: Math.max(...els.map((e) => e.y + e.h)) - topY,
    };
  }
  getViewCenterPosition() {
    return this.center;
  }
  deleteViewElements(elements: EaElement[]): boolean {
    const ids = new Set(elements.map((e) => e.id));
    this.view = this.view.filter((e) => !ids.has(e.id));
    return true;
  }
  measureText(text: string) {
    const m = fakeTextSize(text);
    return { width: m.w, height: m.h };
  }
  addRect(x: number, y: number, w: number, h: number): string {
    return this.add("rect", [x, y, w, h], { x, y, w, h });
  }
  addEllipse(x: number, y: number, w: number, h: number): string {
    return this.add("ellipse", [x, y, w, h], { x, y, w, h });
  }
  addLine(points: number[][]): string {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return this.add("line", [points], { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y });
  }
  addText(x: number, y: number, text: string): string {
    const m = fakeTextSize(text);
    return this.add("text", [x, y, text], { x, y, w: m.w, h: m.h, text, rawText: text });
  }
  addToGroup(ids: string[]): string {
    const groupId = `group-${++this.groups}`;
    this.workbench.forEach((el) => {
      if (ids.includes(el.id)) el.groupIds = [...(el.groupIds ?? []), groupId];
    });
    return groupId;
  }
  addAppendUpdateCustomData(id: string, data: Record<string, unknown>): unknown {
    const el = this.workbench.find((e) => e.id === id);
    if (el) el.customData = { ...el.customData, ...data };
    return el;
  }
  async addElementsToView(): Promise<boolean> {
    this.view.push(...this.workbench);
    this.workbench = [];
    return true;
  }
  /** What Excalidraw's duplicate does: new ids and new group ids, same customData. */
  duplicate(elements: FakeElement[], dx: number, dy: number): FakeElement[] {
    const groupMap = new Map<string, string>();
    const copies = elements.map((el) => ({
      ...el,
      id: `${el.id}-copy`,
      x: el.x + dx,
      y: el.y + dy,
      groupIds: el.groupIds?.map((g) => {
        if (!groupMap.has(g)) groupMap.set(g, `group-${++this.groups}`);
        return groupMap.get(g)!;
      }),
    }));
    this.view.push(...copies);
    return copies;
  }
  selectElementsInView(elements: EaElement[] | string[]): void {
    this.selection = elements.map((e) => (typeof e === "string" ? e : e.id));
    this.selectedGroupIds = {};
  }
}
