// Runs from `npm version <x>` (see .npmrc and the "version" script): copies
// the new version into manifest.json and records it in versions.json with
// the minimum Obsidian version, as the plugin directory expects.

import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";
import { fileURLToPath } from "node:url";

/** The new manifest and versions files for a version, as objects. */
export function bump(manifest, versions, version) {
  return {
    manifest: { ...manifest, version },
    versions: { ...versions, [version]: manifest.minAppVersion },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const version = process.env.npm_package_version;
  if (!version) {
    console.error("version-bump: run this through `npm version <version>`");
    process.exit(1);
  }
  const read = (file) => JSON.parse(readFileSync(file, "utf8"));
  const next = bump(read("manifest.json"), read("versions.json"), version);
  writeFileSync("manifest.json", JSON.stringify(next.manifest, null, 2) + "\n");
  writeFileSync("versions.json", JSON.stringify(next.versions, null, 2) + "\n");
  console.log(`version-bump: ${version}`);
}
