import prettier from "eslint-config-prettier";
import obsidianmd from "eslint-plugin-obsidianmd";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

// The recommended Obsidian config is what the community plugin review runs,
// so `npm run lint` shows the same findings before a release.
export default defineConfig(
  { ignores: ["main.js", "node_modules/", "prototype/", "skills/*/scripts/", "docs/"] },
  ...obsidianmd.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: { allowDefaultProject: ["*.mjs", "scripts/*.mjs"] } },
    },
  },
  // Node scripts and tests are not plugin code.
  {
    files: ["**/*.mjs", "tests/**", "src/cli/**", "*.mts"],
    languageOptions: { globals: { console: "readonly", process: "readonly" } },
  },
  { files: ["**/*.mjs"], extends: [tseslint.configs.disableTypeChecked] },
  {
    // Build scripts print what they did; tests load .mjs scripts and run the prototype.
    files: ["scripts/**", "tests/**"],
    rules: {
      "obsidianmd/rule-custom-message": "off",
      "no-unsanitized/method": "off",
      "@typescript-eslint/no-implied-eval": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
    },
  },
  prettier,
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
