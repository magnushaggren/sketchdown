// Renders a spec from the command line: npm run sketch -- spec.txt out.svg out.png
// Bundles src/cli/sketch.ts with esbuild into node_modules/.cache, then runs it.

import { build } from "esbuild";
import process from "node:process";
import { URL, fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const outfile = fileURLToPath(
  new URL("../node_modules/.cache/sketchdown/sketch.mjs", import.meta.url),
);

await build({
  entryPoints: [`${root}/src/cli/sketch.ts`],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile,
  logLevel: "error",
});
const { main } = await import(pathToFileURL(outfile).href);
process.exitCode = main(process.argv.slice(2));
