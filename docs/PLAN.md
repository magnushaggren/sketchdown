# Sketchdown phase 2 plan

Goal: turn the working prototype (`prototype/Sketchdown.md`) into an
Obsidian plugin that feels like Balsamiq inside Excalidraw. You type a
little text and get a clean, editable, hand-drawn component.

Update the Status column as work lands.

| # | Milestone | Status |
|---|---|---|
| M0 | Repo scaffold and port of the prototype | todo |
| M1 | Plugin UX: commands, editor modal, settings | todo |
| M2 | Fast editing: paste-to-create, click-to-edit | todo |
| M3 | Component library expansion | todo |
| M4 | Wireframes in markdown notes (SVG renderer) | todo |
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
  - a backwards-compatibility test that v1 and v2 sources parse.
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
  - default fence keyword (see M2).
- **Done when** a screen can be built entirely from the modal without
  reading docs, using the snippet palette.

## M2 – Fast editing

- `onPasteHook`: pasting text that starts with a known keyword, or a fenced
  ```` ```sketchdown ```` block, creates a component at the pointer.
- Click-to-edit. Investigate options and pick one with the owner:
  - (a) set an element `link` such as `obsidian://sketchdown?...` and handle
    it with `onLinkClickHook`;
  - (b) a toolbar or context-menu entry when a tagged element is selected;
  - (c) a hotkey only, which is the current behaviour.
- Preserve the position when the size changes. Optionally keep the
  user-adjusted width for `tabs` and `box` by storing the last bounding box.
- **Done when** paste → tweak → regenerate takes a few seconds.

## M3 – Component library

- Build the [planned] list in SYNTAX.md in the agreed priority order, each
  with parser tests, a snapshot test and a gallery entry.
- Add a "gallery" test fixture: a spec that uses every component. Render it
  to SVG in CI and commit the image, so visual regressions show up in diffs.
- Modifiers: `(disabled)` and `(fill)`. Width negotiation in rows: two-pass
  layout where fill children share the leftover width.

## M4 – Markdown notes

- `registerMarkdownCodeBlockProcessor("sketchdown", ...)` renders the same
  spec as an SVG in reading view and live preview, using the shared core and
  the SVG adapter. Use Excalifont where possible, so it looks like the canvas.
- Command "Send to Excalidraw": copy a code block into the active or a new
  drawing as native elements.

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
