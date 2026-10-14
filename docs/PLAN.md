# Sketchdown phase 2 plan

Goal: turn the working prototype (`prototype/Sketchdown.md`) into an
Obsidian plugin that feels like Balsamiq inside Excalidraw. You type a
little text and get a clean, editable, hand-drawn component.

Update the Status column as work lands.

| # | Milestone | Status |
|---|---|---|
| M0 | Repo scaffold and port of the prototype | done (checked in owner's vault 2026-10-14) |
| M1 | Plugin UX: commands, editor modal, settings | done (checked in owner's vault 2026-10-14) |
| M2 | Fast editing: paste-to-create, click-to-edit | done (checked in owner's vault 2026-10-14) |
| M3a | Foundations and the portal patterns | done (checked in owner's vault 2026-10-14) |
| M3b | Rest of the component library | done (checked in owner's vault 2026-10-14) |
| M4 | Wireframes in markdown notes (SVG renderer) | in progress |
| M5 | Polish and release | todo |

## M0 – Scaffold and port

- Start from the official Obsidian sample plugin layout: TypeScript, esbuild,
  `manifest.json` with id `sketchdown` and `isDesktopOnly: false`.
- Add vitest, ESLint and Prettier.
- Port the prototype into `src/core` (parse, layout, components) and
  `src/adapters/excalidraw.ts`, following the architecture in CLAUDE.md.
- Add one command, "Sketchdown: create or edit wireframe", with the same
  three flows as the prototype:
  1. selected tagged component → edit;
  2. single selected text element → convert;
  3. nothing selected → prompt.
- Tests:
  - parser tests for every rule in SYNTAX.md;
  - layout snapshot tests of DrawOps for the prototype's EXAMPLE and the
    "New user" box form;
  - a differential test that runs the prototype's own code and the port
    against a recording fake of ExcalidrawAutomate and compares every call;
  - a backwards-compatibility test that v2 sources parse (v1 is out of scope).
- **Done when** the owner's existing drawings regenerate with no visible
  difference, and `npm test` passes.

## M1 – Plugin UX

- Editor modal instead of the generic prompt:
  - monospace textarea with Tab/Shift-Tab indentation;
  - a live SVG preview beside it, using `adapters/svg.ts` with rough.js;
  - an error list with line numbers;
  - Ctrl/Cmd+Enter to apply.
- Command for a quick-insert palette: pick a component and get a snippet
  inserted into the modal.
- Settings:
  - colours;
  - font size;
  - gaps;
  - use canvas style vs fixed style;
  - default fence keyword: moved to M2, where it is first used.
- **Done when** a screen can be built entirely from the modal without
  reading docs, using the snippet palette.

## M2 – Fast editing

- `onPasteHook`: pasting a fenced ```` ```sketchdown ```` block, or text
  that parses without errors, creates a component at the pointer. A setting
  turns off the unfenced case; Shift+paste pastes plain text.
- Fence keyword: only `sketchdown` for now (agreed 2026-10-14). A
  configurable keyword (such as Wireframy's `wf`) is a possible later
  addition, if needed.
- Click-to-edit, agreed 2026-10-14: (b) an "Edit wireframe" button in
  Excalidraw's element toolbar (`registerElementActionProvider`), plus (c)
  the hotkey. Rejected: (a) an element link with `onLinkClickHook`, because
  the link icon shows on the canvas and ends up in exports. Possible later:
  (d) double-click opens the editor, as an opt-in setting; there's no API
  for it, so it would listen to DOM events.
- Position is kept: regenerating keeps the top-left. Keeping a resized width
  was dropped, because resizing a group scales its text too; `(w=...)` in
  the spec does the job and is documented in SYNTAX.md.
- **Done when** paste → tweak → regenerate takes a few seconds.

## M3a – Foundations and the portal patterns (done)

Agreed 2026-10-14. Input: the owner's portal web app (screenshots shared
2026-10-13, not stored in the repo). Each step gets parser tests first, a
snapshot test and a gallery entry.

1. Foundations:
   - flag options `(fill, disabled, dark, round, segmented, underline, plain,
     striped)`; brackets holding anything else stay part of the text;
   - parents pass a size down to `(fill)` children, so they stretch; without
     `(fill)` everything draws as before;
   - per-op text colour and font size;
   - `(disabled)` greys out any component.
2. Gallery: one spec using every component, rendered by `npm test` to
   `docs/gallery.svg`; the test fails if the committed file differs.
3. Icons, a built-in set drawn with lines and circles: `icon: search` on its
   own line, `{search}` inside labels.
4. `input:`, `search:`, `password:`, `textarea:`, `heading:` (`h1:`,
   `h2:`), icon-only buttons and `(round)`.
5. `columns:` for full-height panels side by side, `(fill)` in rows, boxes
   and columns, `(dark)` panels.
6. `nav:` (icon + label items, one active) and `avatar:`.
7. Tab styles `(segmented)` and `(underline)`; grid styles `(plain)` and
   `(striped)`; `{dot}` status dots.
8. `details:`: rows of icon, label and value.
9. A "Portal screen" snippet, docs, deploy.

Decisions: there is no bold, because Excalidraw text has no weight. Headings
are bigger, and secondary text is grey.

**Done when** the owner can redraw a portal screenshot from a spec.

## M3b – Rest of the component library (done)

Order agreed 2026-10-14. As in M3a, each step gets parser tests first, a
snapshot test, a gallery entry and a SYNTAX.md update, and is deployed for a
vault check.

1. Frames, containers built on `box` with one shared frame helper:
   - `window: Title`: title bar with minimise, maximise and close controls;
   - `dialog: Title` (alias `modal`): title bar with a close ×, and an
     offset grey shadow;
   - `browser: Title | url`: title, address bar, back/forward icons;
   - `phone:`: rounded device frame, 375×667 by default, with a status bar;
   - `buttons: Cancel | *OK`: a button group on the right of its parent's
     width, for dialog footers.
2. Text: inline `[link]` (blue, underlined) and `-disabled-` (grey) in
   labels, `link:`, `paragraph: lorem (lines=4)` (wrapped placeholder text).
3. Form controls: `radio: A | *B` (also `(o)`/`( )`), `toggle: [on] Wi-Fi`,
   `slider: 40%`.
4. Feedback and media: `alert: {info} Saved!`, `progress: 60%`,
   `tooltip: Copied`, `image: 320x180`.
5. Navigation: `breadcrumb: Home > *Anna`, `pagination: < 1 *2 3 >`,
   `menu:` (nav-like, with shortcuts and `>` for submenus), `tree:`
   (indented continuation lines, `+` collapsed, `-` expanded).
6. Snippets for each new component plus "Dialog" and "Mobile screen", docs,
   deploy.

Decisions (2026-10-14): no `_italic_`, because Excalidraw text has no
italic. Dialog footers use a `buttons:` keyword rather than a general
alignment flag. `window` and `dialog` are separate keywords. Alert variants
like `(error)` wait until asked for.

**Done when** the owner can draw a desktop dialog and a mobile screen from a
spec.

## M4 – Markdown notes

Agreed 2026-10-14. A ```` ```sketchdown ```` block in a note renders as the
same wireframe, in reading view and live preview.

1. `renderBlock(source, env)` → SVG and errors, from the shared core and the
   SVG adapter, without Obsidian imports; vitest tests.
2. Text measuring outside a drawing: the Excalidraw plugin's `measureText`
   when it is loaded, else a canvas measurer with the same font. Wait for
   the font, and re-render once it has loaded.
3. `registerMarkdownCodeBlockProcessor("sketchdown", ...)`: the SVG scaled
   down to the note's width, errors listed below it, colours inverted in a
   dark theme as in the modal. Style from the "fixed style" settings. A
   setting turns block rendering off.
4. Moving a block to a drawing: a "Copy for Excalidraw" button on the block
   (pasting uses the M2 paste hook), and a "Send to Excalidraw" command that
   draws the block under the cursor in the most recently used drawing,
   tagged so it can be edited. Creating a new drawing can come later.
5. Docs, a test that every gallery spec renders as a block, deploy.

Decisions (2026-10-14): reuse the fonts the Excalidraw plugin loads, with a
fallback, rather than bundling Excalifont. Blocks use the fixed-style
settings. Wide blocks are scaled down to fit, not scrolled.

**Done when** a block in a note looks like the same spec on a canvas, and
can reach a drawing in one step.

## M5 – Polish and release

- Dark-mode check (Excalidraw inverts colours; confirm the fills look right).
- Performance with large grids (100+ rows).
- README with GIFs, a syntax cheat-sheet and credits (Balsamiq inspiration,
  Wireframy syntax ideas, Excalidraw and the Obsidian Excalidraw plugin).
- Decide the final name and check it's free on GitHub, npm and the Obsidian
  directory. Then submit to the community plugins list.

## Open questions for the owner

1. Final name: Sketchdown, Kladd, or something else? It affects the plugin
   id and the fence keyword.
2. Fence keyword in notes: `sketchdown`, `wf` (Wireframy-compatible) or `kladd`?
3. Should hand edits inside a component group survive regeneration, or is
   "text is the truth" fine for good?
4. Support for plain Excalidraw outside Obsidian (excalidraw.com) later? If
   yes, keep `core` publishable as its own npm package.
