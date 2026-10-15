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
| M4 | Wireframes in markdown notes (SVG renderer) | done (checked in owner's vault 2026-10-14) |
| M5 | Polish and release | in progress: 0.9.1 beta on BRAT, verified in a fresh vault; README GIFs added (2026-10-14); the 1.0 submission to come |
| M6 | Screenshot to wireframe (a skill for LLM agents) | done: placeholder, `npm run sketch`, the skill, three trial screens, ranked ideas (2026-10-15) |
| M7 | Forms and detail panels | in progress: steps 1 (form, field, floating) and 2 (required, invalid) done (2026-10-15) |

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

Agreed 2026-10-14.

1. Name: Sketchdown stays (decided 2026-10-14). Check it is free in the
   Obsidian community list, on GitHub and on npm. `sketchdown` stays the
   customData key and fence keyword for good.
2. Review against Obsidian's plugin guidelines: command names and settings
   wording, no default hotkeys, no unsafe HTML, cleanup on unload, the
   2-second toolbar polling, the right `minAppVersion`, bundle size.
3. Mobile: one pass on a phone or tablet (paste, modal, note blocks, copy).
   No mobile app to test with yet, so the beta is desktop-only (2026-10-14).
   If something is broken and not cheap to fix, release desktop-only.
4. Performance: time 100- and 500-row grids, on the canvas and as a note
   block; fix what is slow (likely by caching measurements).
5. Dark mode: the rest of the check started in M4 (dialog shadow, tooltip,
   disabled grey, links), on the canvas and in notes.
6. README: install, a syntax cheat sheet generated from SYNTAX.md, the
   gallery, settings, credits (Balsamiq, Wireframy, Excalidraw and the
   Obsidian Excalidraw plugin). The owner records two or three GIFs.
7. Release machinery: a GitHub Actions workflow that builds on a version tag
   and attaches `main.js`, `manifest.json` and `styles.css`; a version bump
   script for `manifest.json`, `versions.json` and `package.json`.
8. Publish: a public GitHub repo under the owner's account (created with
   `gh`, checked with the owner before the first push), a 0.9 beta for
   BRAT, then 1.0 and the pull request to `obsidianmd/obsidian-releases`,
   which the owner opens from his account.

**Done when** the plugin is listed or the submission is open, and a new user
can install it and draw a first wireframe from the README alone.

## M6 – Screenshot to wireframe

Agreed 2026-10-14, during the week the 0.9.1 beta runs. Goal: give an LLM
agent a screenshot of a UI and get a Sketchdown spec back that mimics it,
with sized placeholders for what the syntax can't draw yet and a list of
components worth adding. The plugin stays offline: the LLM runs outside it,
as an agent skill.

1. `placeholder` component: `placeholder: 240x40 Date picker` draws a dashed
   box of that size with the name in the middle, so gaps stand out and can
   be found by searching for `placeholder:`.
2. A command-line tool, `npm run sketch -- spec.txt out.svg`: reports parse
   errors with line numbers and renders the spec to SVG (and PNG through
   headless Chrome), so the agent can compare its output with the
   screenshot and fix it.
3. The skill, `skills/screenshot-to-sketchdown/`: a method (frame, then
   regions, then components, sizes scaled from the body text), when to use
   a placeholder, optional structured metadata (for example the Cendot
   `runtime.json` files: exact captions, editor types, grid columns), a
   syntax reference generated from SYNTAX.md, and a gap report as output.
   Anything specific to one application stays out of this repo.
4. Trial on the owner's screenshots: three web portal screens and three or
   four Cendot WPF screens (grid, detail, account detail). Gap reports are
   collected in `docs/component-ideas.md`.
5. Pick the gaps to build in M7 (done: see M7). Candidates seen in step 4: form field with an
   aligned label column, collapsible section header with a count, toolbar,
   card, floating-label field, vertical split, icon rail (an icon-only
   `nav` is still about 120 wide and ignores `w=`),
   grid extras
   (filter row, group-by bar, status bar), more icons (refresh, print,
   database, clock, code, key, error, ban).

**Done when** the owner can hand a screenshot to the agent and paste the
result into a drawing with only small fixes, and the gap list is ranked.

## M7 – Forms and detail panels

Agreed 2026-10-15 from the M6 trials (docs/component-ideas.md). Theme:
the patterns that made every converted form look ragged or lose meaning.
Everything is new syntax on top of what exists, so old specs draw as before.

1. **Forms with aligned labels** (ideas #1, #9). A `form` container lines
   up its fields' labels in one column; `field: Label | component line`
   puts a label before any one-line component. Both trial agents guessed
   this syntax on their own.

   ```
   form: (label=140)
     field: Customer | search: Search...
     field: AD Domain | dropdown: *Sweden | Norway
     row:
       field: Version | input: 4.2
       field: Updated | input: {calendar} 2026-10-14
   ```

   - Without `(label=...)` the column is as wide as the longest label.
     Fields side by side in a `row` get a label column each.
   - A `field` also works outside a `form`, unaligned.
   - `(floating)` on a field draws the label small inside the top border,
     as in Material design: `field: Type | dropdown: Virtual Server (floating)`.
2. **Required and invalid** (#2). `(required)` on a field's component adds
   a red `*` after the label; `(invalid)` draws the field's outline red with
   an error icon inside on the right. New theme colour `error` (#e03131),
   a setting like the others.
3. **Groups that fold** (#3, #17, #4).
   - `box: Domain (collapsible)` adds a chevron to the title bar;
     `(collapsed)` draws only the title bar, with the chevron pointing down.
   - `section: {users} Ownership (count=3)`: a header line with an optional
     icon, the title, a grey count and a chevron, then its children
     indented under it (a container without a border). `(collapsed)` hides
     them.
   - `box (plain)`: a container with no border or padding, for stacking
     groups in a column.
   - `row (top)`: children aligned at the top instead of centred.
4. **Field details** (#5, #12, #16).
   - `(empty)` on `dropdown`, `password` and `input` draws a blank field
     (today a dropdown says "Select…" and a password shows 8 dots).
   - An `{icon}` at the very end of an `input`, `search` or `dropdown`
     text is drawn at the right edge as a trailing button: `search:
     Search... {edit}`.
   - `spin: 12` (alias `number`, `stepper`): a narrow field with up and
     down arrows.
   - `details (stacked)`: the label above its value, for detail drawers.
5. **Icons** (#15): key, warning, refresh, print, database, clock, code,
   ban, cloud, map, hash, network, grid. Each drawn with lines and
   ellipses like the existing set.
6. **Wrap-up**: gallery, snippets ("Form", "Detail drawer"), SYNTAX.md,
   regenerate the skill and update its mapping table, then rerun the three
   trial screens and compare with the M6 results.

Deferred to later, still ranked in docs/component-ideas.md: toolbar,
card, icon rail, vertical split (`rows`), drawer frame, rich-text editor,
grid extras, accent colour, clearable fields, `spacer:` alias.

Decided 2026-10-15:

1. The label ends at the first `|` followed by a keyword and a colon.
   `field` was already an alias of `input`, so without such a `|` it stays
   one, and old specs draw as before.
2. `(required)` is a red `*` after the label; `(invalid)` covers the icon.
3. 1.0 is submitted first as planned; M7 ships in 1.1.

## Decided questions

1. Name: Sketchdown, fence keyword `sketchdown` (2026-10-14).
2. Hand edits inside a component group don't survive regeneration: the text
   is the truth, and the README says so (2026-10-14).
3. Plain Excalidraw outside Obsidian is deferred. `core` stays free of
   Obsidian and Excalidraw imports, so it remains possible (2026-10-14).
