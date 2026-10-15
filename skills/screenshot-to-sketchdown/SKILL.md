---
name: screenshot-to-sketchdown
description: Turn a screenshot of a user interface into a Sketchdown wireframe spec (Balsamiq-style wireframes drawn as Excalidraw elements in Obsidian), with sized placeholders for parts the syntax can't draw and a report of missing components. Use when the user shares a UI screenshot and wants a wireframe, mockup, sketch or Sketchdown/Excalidraw version of it.
---

# Screenshot to Sketchdown

You turn a screenshot of a UI into a Sketchdown spec: a few lines of text
that the Sketchdown plugin draws as a hand-drawn wireframe. The user pastes
your spec into an Excalidraw drawing or a note. Aim for a wireframe a
designer would draw: the same structure, regions, proportions and content,
not a pixel copy.

Deliver three things, in this order:

1. The spec, in one ```` ```sketchdown ```` code block.
2. A **gap report**: what you couldn't draw with existing components.
3. A few lines on assumptions (scale, rows left out, unreadable text).

## Before you start

- Read `reference/syntax.md` in this skill's folder in full. It is the
  complete language; don't use anything it doesn't describe.
- If the user also gives structured data about the screen (a JSON export,
  a field list, grid column definitions), use it for exact labels, field
  types, column names and order. Use the screenshot for layout. The data
  wins when the two disagree about text; the screenshot wins about what is
  visible.

## Method

### 1. Survey the screen

Name, in your head or in a scratch note:

- **The frame.** Use `browser`, `window`, `dialog` or `phone` only when the
  screenshot shows that chrome (address bar, title bar, phone outline). A
  cropped app screen gets no frame.
- **The regions.** Side navigation, header, toolbar, main content, side
  panels, footer. Regions side by side become `columns` (fixed total size)
  or `row`; regions stacked become siblings in a `box` or at the top level.
- **The components** in each region, top to bottom and left to right.

### 2. Work out the scale

Sketchdown draws body text at 16 px. Estimate the body text's font size in
the screenshot (a capital letter is about 0.7 times the font size), and use
`scale = 16 / that size`. Multiply every size you measure by the scale:
`(w=...)`, `(h=...)` and placeholder sizes. Round to tens. Screenshots from
high-density displays often have text 24 to 32 px tall; dense desktop apps
can be 11 to 12 px.

### 3. Map each element to a component

| In the screenshot | In Sketchdown |
|---|---|
| App shell: sidebar, content, details panel | `columns: (w=..., h=...)` with one panel per region; the main one `(fill)` |
| Dark sidebar navigation | `nav: {home} Home \| *{users} Users (dark)` as the first panel |
| Page title | `h1:`; section titles `h2:` |
| Tabs with an underline | `tabs: *Servers \| Devices (underline)` |
| Button group or filter chips | `tabs: *Active \| Inactive \| All (segmented)` |
| Icon-only button | `button: {filter}`; circular: `button: {more} (round)` |
| Primary button | `button: *Save` |
| Group of buttons at the bottom right | `buttons: Cancel \| *OK` |
| Search field | `search: Find users` |
| Select, combo box | `dropdown: *Current value \| Other` |
| Text field with a value | `input: Anna`; empty and labelled: label in a `text:` before it |
| Date field | `input: {calendar} 2026-10-14` |
| Multi-line text | `textarea:` |
| Table | `grid`, header row, then up to about 8 rows; `*` marks a selected row |
| Status dot in a cell | `{dot} Active` |
| Read-only label/value pairs | `details: {mail} E-mail \| anna@example.com`, one pair per line |
| Group box, panel with a title | `box: Title` |
| Card | `box:` with the content inside |
| Things side by side | `row:`; to push items to the right, give the row `(fill)` and the item before them `(fill)` |
| Toolbar | `row:` of buttons with icons, `{plus} Create` |
| Message or banner | `alert: {info} Saved. [Undo]` |
| Disabled control | the component with `(disabled)` |
| Links in text | `[Forgot password?]`; grey text `-like this-` |

Icons: only the names listed in the reference exist. If none fits, leave
the icon out rather than writing a made-up name.

### 4. Placeholders for the rest

When no component fits well, use `placeholder: WxH Name` with the scaled
size, for example `placeholder: 300x200 Line chart` or
`placeholder: 180x48 Floating-label dropdown`. Typical cases: charts, maps,
rich-text editors, date pickers, trees of custom widgets, video, signature
pads, anything app-specific.

- Prefer a placeholder over bending a component into something it isn't.
  Don't use `image` for things that aren't pictures or `grid` for a form.
- A close-enough component with a gap note is fine when it keeps the
  wireframe readable (a floating-label field as a plain `dropdown`).
- Keep names short; a placeholder grows to fit its name.
- Every placeholder, and every compromise like the one above, goes in the
  gap report.

### 5. Check and compare

If Node is available, run the bundled checker from this skill's folder:

```
node <skill folder>/scripts/sketch.mjs spec.txt out.svg out.png
```

It accepts a file with the spec or a ```` ```sketchdown ```` block, or `-`
for standard input. It prints the drawing's size, parse errors, unknown
icons and the placeholders with their sizes, and exits with 1 on errors.
PNG output needs Chrome or Edge (set `SKETCHDOWN_CHROME` to its path if it
isn't found); without one, write only the SVG.

- Fix every error and warning.
- Look at the PNG next to the screenshot: regions in the right places,
  similar proportions, nothing missing or doubled. Fix and run again, up to
  three rounds.
- Text is measured as fixed-width, so widths in the PNG are approximate.

Without Node, check the spec by hand against "Common mistakes".

### 6. Common mistakes

- Options go at the very end of a line, in one pair of brackets:
  `button: Save (disabled)`, `columns: (w=1200, h=700)`.
- Only `grid`, `tabs`, `box`, `row`, `columns` and the frames may be written
  without a colon. `nav (dark)` is an error; write `nav: ... (dark)`.
- Only containers (`box`, `tabs`, `row`, `columns` and the frames) can have
  indented children.
- A line without a keyword continues the component above it (grid rows,
  more tab names, more checkbox items). A blank line ends that.
- Items split on `|`; grid cells on `,`. The first grid row is the header.
- `*` marks the selected or primary item.
- `(fill)` only stretches inside a parent with a known width.

## The gap report

After the spec, under the heading **Gaps**, a table with one row per kind
of missing component (not per occurrence):

| Component | Seen as | Drawn as | Size | Count | Suggested syntax |
|---|---|---|---|---|---|
| Floating-label dropdown | label inside the field's top border | `dropdown` | 180x48 | 2 | `dropdown: Virtual server (label=Type)` |
| Line chart | revenue over 12 months | `placeholder` | 300x200 | 1 | `chart: line (w=300, h=200)` |

Then **Suggested components**: the two or three additions that would have
improved this screen most, one sentence each on why. If the user keeps a
running list of component ideas, add to it instead of starting a new one.

## Example

A screenshot of a user list with a dark sidebar, a title, a status filter,
a search field, a table and a details panel on the right could become:

```sketchdown
columns: (w=1200, h=640)
  nav: {home} Home | *{users} Users | {settings} Settings | - | {back} Log out (dark)
  box (fill)
    row: (fill)
      h1: Users (fill)
      tabs: *Active | Inactive | All (segmented)
      button: {more} (round)
    row:
      search: Find users (w=420)
      dropdown: All teams
      button: {filter}
    grid (fill)
      Name, Role, Team, Status
      *Anna Svensson, Developer, Platform, {dot} Active
      Erik Lund, Designer, Web, {dot} Active
      Maja Berg, Tester, Platform, -Away-
  box: Details (w=320)
    avatar: AS
    h2: Anna Svensson
    details: {mail} E-mail | anna@example.com
    {phone} Phone | 070-123 45 67
    placeholder: 280x120 Activity chart
    buttons: *Edit
```

Gaps: one row for the activity chart. Suggested components: a small chart
component, since dashboards use them often.
