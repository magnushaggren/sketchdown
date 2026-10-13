# Sketchdown

Balsamiq-style wireframes for Excalidraw inside Obsidian. You write a short
text spec ("tabs: A | *B", "grid" + CSV rows, "button: *Save"), and the
plugin draws it as **native Excalidraw elements** (rectangles, lines, text)
in Excalidraw's hand-drawn style. Because the result is ordinary Excalidraw
shapes, the user can annotate, connect arrows and keep using every other
Excalidraw feature around it. The text spec is the single source of truth:
editing a component means editing its text and regenerating it.

"Sketchdown" is a working name. Keep it in one place (constants + manifest)
so it can be renamed.

## Status

- Phase 1 (done): a single Excalidraw ScriptEngine script,
  `prototype/Sketchdown.md`. Verified working in the owner's vault. It is
  the reference implementation for behaviour and look. Read it first.
- Phase 2 (this repo): a proper Obsidian plugin in TypeScript. See
  `docs/PLAN.md` for milestones and `docs/SYNTAX.md` for the language spec.

## Architecture (target)

```
src/
  core/          pure TypeScript, no Obsidian or Excalidraw imports
    parse.ts     text -> AST (indentation-based tree)
    layout.ts    AST -> positioned draw ops; measuring is injected
    components/  one file per component: measure + draw into DrawOps
    types.ts     AST nodes, DrawOp = rect | line | text | ellipse, Style
  adapters/
    excalidraw.ts  DrawOps -> ExcalidrawAutomate calls (addRect/addLine/addText)
    svg.ts         DrawOps -> SVG via rough.js (for markdown code blocks, tests)
  plugin/
    main.ts      Obsidian Plugin: commands, settings, hooks
    edit.ts      select / edit / regenerate flow
    modal.ts     spec editor modal
tests/           vitest; parser, layout and snapshot tests of DrawOps
prototype/       Phase 1 script, kept as reference (do not edit)
```

Rules:
- `core/` must stay free of Obsidian and Excalidraw imports, so it can be
  unit-tested in Node and reused later (e.g. plain Excalidraw on the web).
- Components never call Excalidraw directly. They emit DrawOps through a
  context object with a `dry` mode for measuring (see `size()` in the
  prototype; rows use it to centre children).
- Text measurement is an injected function `(text, style) => {w, h}`.
  In Excalidraw use `ea.measureText`; in tests use a fixed-width fake.

## Excalidraw integration facts (verified against plugin v2.29.0 source)

- Get the API with `window.ExcalidrawAutomate.getAPI(view)`; call
  `ea.destroy()` when finished with an instance. The `obsidian-excalidraw-plugin`
  npm package is outdated (1.9.x), so do not rely on its types. Declare the
  small subset we use in `src/adapters/ea-types.ts`, or vendor types from the
  plugin repo `src/shared/ExcalidrawAutomate.ts`.
- Wait for Obsidian's `workspace.onLayoutReady` and check that
  `app.plugins.plugins["obsidian-excalidraw-plugin"]` is loaded before use.
- Used API: `setView`, `getViewSelectedElements`, `getViewElements`,
  `getBoundingBox`, `deleteViewElements`, `addRect`, `addLine`, `addText`,
  `measureText`, `style`, `addToGroup`, `addAppendUpdateCustomData(id, data)`,
  `addElementsToView(false, true, true)`, `selectElementsInView`,
  `getViewCenterPosition`, `getExcalidrawAPI().getAppState()`.
- Hooks available for later milestones: `onPasteHook` (return false to stop
  default paste), `onSceneChangeHook`, `onLinkClickHook`, `onDropHook`.
- Line points passed to `addLine` are absolute canvas coordinates.
- Style must be set on `ea.style` before every add call. Set it fully each
  time (stroke, background, fillStyle "solid", strokeWidth, roughness,
  roundness, opacity, angle), because it is shared state.

## Stored data contract (keep backwards compatible)

Every generated element gets
`customData.sketchdown = { source: string, instance: string, v: number }`.
- `source`: the full spec text of the whole component tree.
- `instance`: shared id for all elements of one generated component.
- `v`: format version, currently 2. Only v2 sources need to keep working.
All elements of an instance are also put in one group. Regenerating means:
find every element with the same `instance`, take their bounding-box
top-left, delete them, draw the new version at that point.

## Look and feel

- Use the canvas's current stroke colour, font family and roughness from
  appState, so components match the user's drawing.
- Font size 16. Colours: fill `#e9ecef`, primary `#a5d8ff`, selected row
  `#d0ebff`, inputs `#ffffff`. Outer frames strokeWidth 2, inner lines 1.
- Gaps: root stack 24, container stack 14, row 12, container padding 16.
- Match the prototype's output pixel-for-pixel until a change is agreed.

## Commands

- `npm run dev`: esbuild watch build to `main.js`
- `npm run build`: type-check and production build
- `npm test`: vitest (`tests/parity.test.ts` runs the prototype's own code
  against the port, so it fails on any change to what is drawn)
- `npm run lint`, `npm run format`: ESLint and Prettier
- `npm run deploy`: build, then copy `main.js`, `manifest.json` and
  `styles.css` to the plugin folder named in `deploy.local.json` (not
  committed; `{ "pluginDir": "<vault>/.obsidian/plugins/sketchdown" }`)
- Manual testing: run `npm run deploy`, then reload the plugin in Obsidian.
  Do not symlink the repo into the vault: the owner's vault is in OneDrive,
  which then tries to sync the whole repo. The owner tests in his own vault,
  so describe exactly what to try after each change.

## Working agreements

- Work milestone by milestone from `docs/PLAN.md`. Propose a short plan
  before starting each milestone, then implement, then update PLAN.md status.
- Any syntax change updates `docs/SYNTAX.md` and gets parser tests first.
- Keep the prototype's behaviour unless the plan says otherwise. Old specs
  stored in drawings must still regenerate.
- No network access from the plugin. No telemetry.
- Licence MIT. The syntax is inspired by Balsamiq and Wireframy (MIT,
  github.com/divyaraj-m/wireframy). Credit both in the README. Do not copy
  Wireframy code without keeping its licence notice.
