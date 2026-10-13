// The working name lives here and in manifest.json, so it can be renamed.
export const PLUGIN_NAME = "Sketchdown";

// Stored data contract: customData[KEY] = { source, instance, v }.
// KEY must keep working for existing drawings even if the plugin is renamed.
export const KEY = "sketchdown";
export const VERSION = 2;

export const EXCALIDRAW_PLUGIN_ID = "obsidian-excalidraw-plugin";
export const EXCALIDRAW_VIEW_TYPE = "excalidraw";
export const MIN_EXCALIDRAW_VERSION = "2.0.0";

export const EXAMPLE = [
  "tabs: Overview | *Users | Settings",
  "  row:",
  "    text: Role",
  "    dropdown: *All roles | Developer | Project manager",
  "    checkbox: [x] Show inactive",
  "  grid",
  "  Name, Role, Active",
  "  Anna, Developer, [x]",
  "  *Erik, Project manager, [ ]",
  "  row:",
  "    button: Cancel",
  "    button: *Save",
].join("\n");
