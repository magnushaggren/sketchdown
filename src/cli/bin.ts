// Entry point of the bundled checker: node sketch.mjs spec.txt out.svg out.png
import { main } from "./sketch";

process.exitCode = main(process.argv.slice(2));
