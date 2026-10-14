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
    detect.ts    find a spec in pasted text (fence or plain)
    layout.ts    AST -> positioned draw ops; measuring is injected
    components/  one file per component: measure + draw into DrawOps
                 (label.ts: text with {icon} tokens; shared.ts: helpers)
    icons.ts     built-in icons drawn with lines and ellipses
    snippets.ts  starting points for the quick-insert palette
    types.ts     AST nodes, DrawOp = rect | line | text | ellipse, Style
  adapters/
    excalidraw.ts  DrawOps -> ExcalidrawAutomate calls (addRect/addLine/addText)
    svg.ts         DrawOps -> SVG string via rough.js (modal preview; later code blocks)
  plugin/
    main.ts      Obsidian Plugin: commands, settings, hook and toolbar setup
    edit.ts      select / edit / regenerate flow, drawSpec
    hooks.ts     paste handling and the toolbar button, testable without Obsidian
    modal.ts     spec editor modal with live preview and error list
    picker.ts    snippet palette
    textedit.ts  indent, newline and snippet insertion as pure functions
    settings.ts  settings shape, defaults, validation (no Obsidian imports)
    settingsTab.ts  settings UI
    block.ts     renders a ```sketchdown note block to SVG (no Obsidian imports)
    blockView.ts puts a rendered block on the page
    measure.ts   text measuring outside a drawing (canvas, Excalidraw line heights)
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

## Excalidraw integration facts (verified against plugin v2.29.0 source; the owner's vault runs 2.27.3)

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
- Hooks live on an EA instance. A view calls the hooks of its "hook server",
  which is the global `window.ExcalidrawAutomate` unless a script called
  `registerThisAsViewEA`. Each hook is one shared slot, so chain to the
  previous value and restore it on unload (see `installPasteHook`).
- `onPasteHook({ payload, event, view, pointerPosition })`: `payload.text`,
  `payload.elements`, `payload.files`; `pointerPosition` is in scene
  coordinates; return false to stop the default paste. `view.modifierKeyDown`
  tells whether Shift is held.
- `registerElementActionProvider(getActions)` (not in older versions, so
  feature-detect) adds buttons to the toolbar above a **single** selected
  element; a selected group doesn't show it. It returns an unregister
  function, which a plugin must call on unload: `ea.destroy()` only removes
  providers registered by Excalidraw scripts, so a forgotten one survives a
  plugin reload and keeps running the old code. The view's menu (and its
  providers) is recreated when the view loads another drawing.
- Excalidraw may see paste events from the whole window, including text
  fields in Obsidian modals (suspected, not confirmed); the paste hook
  ignores pastes into text fields outside the drawing.
- Not used yet: `onSceneChangeHook`, `onLinkClickHook`, `onDropHook`.
- `getAPI()` without a view works for `measureText`, which notes use;
  destroy the instance afterwards.
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
- M3a colours: disabled `#adb5bd`, secondary text `#868e96`, dark panel
  `#343a40` with text `#f8f9fa`, striped rows `#f1f3f5`. Headings are 1.75
  (h1) and 1.375 (h2) times the font size; there is no bold.
- M3b: links `#1971c2` (a setting). Frames (`window`, `dialog`, `browser`,
  `phone`) are filled white and drawn before their content; the dialog
  shadow is the disabled grey, offset 8. Nothing may draw outside the size a
  component returns (e.g. the slider knob), because regenerating keeps the
  bounding box's top-left.
- M6: `placeholder` is a dashed, rounded, unfilled box (`dashed` on a rect
  op, left out when solid) with its name grey in the middle.
- Layout contract: a parent may pass a `Slot` ({w, h}) to a child, which
  then makes itself at least that big. Parents only pass one to `(fill)`
  children (and heights to `columns` panels), so specs without the new
  options draw exactly as the prototype did.
- Draw ops only carry `color`/`fontSize` keys when set; the parity test
  depends on that.
- Match the prototype's output pixel-for-pixel until a change is agreed.

## Commands

- `npm run dev`: esbuild watch build to `main.js`
- `npm run build`: type-check and production build
- `npm test`: vitest (`tests/parity.test.ts` runs the prototype's own code
  against the port, so it fails on any change to what is drawn).
  `tests/gallery.test.ts` renders `tests/fixtures/gallery.ts` to
  `docs/gallery.svg` and fails when it differs; add every new component to
  the gallery, and run `npm test -- -u` to accept an intended change.
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
