import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["main.js", "node_modules/", "prototype/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  { files: ["**/*.mjs"], languageOptions: { globals: { console: "readonly" } } },
  {
    // core/ must stay free of Obsidian and Excalidraw imports (see CLAUDE.md).
    files: ["src/core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["obsidian", "obsidian/*", "**/adapters/*", "**/plugin/*", "**/constants"] },
      ],
    },
  },
);
