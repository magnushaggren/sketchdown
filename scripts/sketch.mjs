// Renders a spec from the command line: npm run sketch -- spec.txt out.svg out.png
// Bundles src/cli/bin.ts with esbuild into node_modules/.cache, then runs it.

import { build } from "esbuild";
import { URL, fileURLToPath, pathToFileURL } from "node:url";

const outfile = fileURLToPath(
  new URL("../node_modules/.cache/sketchdown/sketch.mjs", import.meta.url),
);

await build({
  entryPoints: [fileURLToPath(new URL("../src/cli/bin.ts", import.meta.url))],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  logLevel: "error",
});
await import(pathToFileURL(outfile).href);
