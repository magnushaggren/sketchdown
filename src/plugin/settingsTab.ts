import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { DEFAULT_SETTINGS, LIMITS, isColor } from "./settings";
import type { Settings } from "./settings";

export interface SettingsOwner extends Plugin {
  settings: Settings;
  saveSettings(): Promise<void>;
}

const COLORS: [keyof Settings["colors"], string, string][] = [
  ["fill", "Component fill", "Buttons, tab strips, grid headers and title bars."],
  ["primary", "Primary button", "Buttons marked with *."],
  ["selected", "Selected row", "Grid rows marked with *."],
  ["paper", "Inputs", "The inside of dropdowns and checkboxes."],
  ["disabled", "Disabled", "Lines and text of components marked (disabled)."],
  ["muted", "Secondary text", "Placeholders and the values in detail lists."],
];

const GAPS: [keyof Settings["gap"], string, string][] = [
  ["root", "Between top-level components", ""],
  ["stack", "Between components in a box or tab", ""],
  ["row", "Between components in a row", ""],
  ["pad", "Padding", "Space between a box or tab panel and its content."],
];

// Excalidraw's font family numbers.
const FONTS: Record<string, string> = {
  "5": "Excalifont (hand-drawn)",
  "6": "Nunito (normal)",
  "8": "Comic Shanns (code)",
  "1": "Virgil",
  "2": "Helvetica",
  "3": "Cascadia",
  "7": "Lilita One",
};

const ROUGHNESS: Record<string, string> = { "0": "Architect", "1": "Artist", "2": "Cartoonist" };

export class SketchdownSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly owner: SettingsOwner,
  ) {
    super(app, owner);
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.owner.settings;
    const save = () => void this.owner.saveSettings();
    containerEl.empty();

    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Changes apply to components the next time they are created or edited. Existing drawings stay as they are until then.",
    });

    new Setting(containerEl).setName("Colours").setHeading();
    for (const [key, name, desc] of COLORS) {
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc)
        .addColorPicker((picker) =>
          picker.setValue(settings.colors[key]).onChange((value) => {
            if (!isColor(value)) return;
            settings.colors[key] = value;
            save();
          }),
        )
        .addExtraButton((button) =>
          button
            .setIcon("reset")
            .setTooltip("Restore default")
            .onClick(() => {
              settings.colors[key] = DEFAULT_SETTINGS.colors[key];
              save();
              this.display();
            }),
        );
    }

    new Setting(containerEl).setName("Text and spacing").setHeading();
    this.numberSetting(
      "Font size",
      "Boxes and buttons grow with the text. Check marks and arrows keep their size.",
      LIMITS.fontSize,
      DEFAULT_SETTINGS.fontSize,
      () => settings.fontSize,
      (value) => (settings.fontSize = value),
    );
    for (const [key, name, desc] of GAPS) {
      this.numberSetting(
        name,
        desc,
        LIMITS.gap,
        DEFAULT_SETTINGS.gap[key],
        () => settings.gap[key],
        (value) => (settings.gap[key] = value),
      );
    }

    new Setting(containerEl).setName("Pasting").setHeading();
    new Setting(containerEl)
      .setName("Create wireframes from pasted specs")
      .setDesc(
        "Pasting text that is a valid spec draws it at the pointer. A ```sketchdown code block is drawn even when this is off. Ctrl/Cmd+Shift+V pastes as plain text.",
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.pastePlainSpecs).onChange((value) => {
          settings.pastePlainSpecs = value;
          save();
        }),
      );

    new Setting(containerEl).setName("Stroke and font").setHeading();
    new Setting(containerEl)
      .setName("Use the canvas style")
      .setDesc(
        "Draw with the stroke colour, font and sloppiness currently chosen in the drawing. Turn off to always use the values below.",
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.useCanvasStyle).onChange((value) => {
          settings.useCanvasStyle = value;
          save();
          this.display();
        }),
      );
    if (!settings.useCanvasStyle) {
      new Setting(containerEl).setName("Stroke colour").addColorPicker((picker) =>
        picker.setValue(settings.fixed.stroke).onChange((value) => {
          if (!isColor(value)) return;
          settings.fixed.stroke = value;
          save();
        }),
      );
      new Setting(containerEl).setName("Font").addDropdown((dropdown) =>
        dropdown
          .addOptions(FONTS)
          .setValue(String(settings.fixed.fontFamily))
          .onChange((value) => {
            settings.fixed.fontFamily = Number(value);
            save();
          }),
      );
      new Setting(containerEl).setName("Sloppiness").addDropdown((dropdown) =>
        dropdown
          .addOptions(ROUGHNESS)
          .setValue(String(settings.fixed.roughness))
          .onChange((value) => {
            settings.fixed.roughness = Number(value);
            save();
          }),
      );
    }
  }

  private numberSetting(
    name: string,
    desc: string,
    limits: { min: number; max: number },
    fallback: number,
    get: () => number,
    set: (value: number) => void,
  ): void {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(
        [desc, `${limits.min}–${limits.max}, default ${fallback}.`].filter(Boolean).join(" "),
      )
      .addText((text) => {
        text.inputEl.type = "number";
        text.inputEl.min = String(limits.min);
        text.inputEl.max = String(limits.max);
        text.setValue(String(get())).onChange((raw) => {
          const value = Number(raw);
          // out-of-range values are ignored while typing, e.g. "1" on the way to "16"
          if (!raw.trim() || !isFinite(value) || value < limits.min || value > limits.max) return;
          set(value);
          void this.owner.saveSettings();
        });
      })
      .addExtraButton((button) =>
        button
          .setIcon("reset")
          .setTooltip("Restore default")
          .onClick(() => {
            set(fallback);
            void this.owner.saveSettings();
            this.display();
          }),
      );
  }
}
