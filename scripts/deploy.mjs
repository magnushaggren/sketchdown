// Copies the built plugin into an Obsidian vault. The files are copied
// rather than linked, because a vault in OneDrive would sync the whole repo
// through a link.
//
// The destination comes from deploy.local.json (not committed):
//   { "pluginDir": "C:/path/to/vault/.obsidian/plugins/sketchdown" }

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";

const CONFIG = "deploy.local.json";
const FILES = ["main.js", "manifest.json", "styles.css"];

function fail(message) {
  console.error(`deploy: ${message}`);
  process.exit(1);
}

if (!existsSync(CONFIG)) {
  fail(
    `${CONFIG} not found. Create it with { "pluginDir": "<vault>/.obsidian/plugins/sketchdown" }`,
  );
}
const { pluginDir } = JSON.parse(readFileSync(CONFIG, "utf8"));
if (!pluginDir) fail(`${CONFIG} has no "pluginDir"`);
if (!existsSync(dirname(pluginDir))) {
  fail(`${dirname(pluginDir)} does not exist; is "pluginDir" inside a vault's plugins folder?`);
}
for (const file of FILES) {
  if (!existsSync(file)) fail(`${file} not found; run the build first`);
}

mkdirSync(pluginDir, { recursive: true });
for (const file of FILES) copyFileSync(file, join(pluginDir, file));
console.log(`deploy: copied ${FILES.join(", ")} to ${pluginDir}`);
console.log("deploy: reload the plugin in Obsidian to pick up the change");
