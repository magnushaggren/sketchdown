# Sketchdown syntax

Status markers: **[v2]** implemented in the prototype, **[M3a]** added in milestone M3a, **[planned]** not built yet.

## Structure [v2]

- One component per line: `keyword: content (options)`.
- `grid`, `tabs`, `box` and `row` may also appear without a colon.
- Indentation nests components. Anything indented deeper than a container
  line (`tabs`, `box`, `row`) goes inside it. Tabs count as 4 spaces.
- Lines that don't start with a keyword are **continuation lines** of the
  most recent component, for example grid rows, extra tab names or more
  checkbox items. A blank line ends the continuation.
- Indenting a component under a non-container is an error. Errors list the
  line number and the rest of the spec is still drawn.
- Top-level components stack vertically with a gap of 24.
- Options at the end of a line, in brackets: `(w=500, h=220)`. Numeric
  `k=v` pairs: `w` sets a minimum width on `box`, `tabs`, `button` and
  `dropdown`; `h` a minimum height on `box`, `tabs` and `button`. Use them
  to keep a component wide when its content shrinks.
- **[M3a]** Flags may stand alone in the same brackets: `(fill, disabled)`.
  Known flags: `fill`, `disabled`, `dark`, `round`, `segmented`,
  `underline`, `plain`, `striped`. Brackets that hold an unknown word and no
  `k=v` pair are part of the text, so `box: Title (optional)` keeps its
  title. Flags and pairs mix: `(w=200, fill)`. What each flag does is listed
  under the components that use it.
- **[M3a]** Bare keywords take options too: `grid (plain)`, `box (w=50)`.
- `*` marks the selected or active item: tab, dropdown value, grid row, or
  primary button.
- Lists split on `|`, and on `,` if no `|` is present. Exception: checkbox
  items split on `|` only.

## Pasting onto the canvas

- A fenced block with the info string `sketchdown` is always drawn when
  pasted. If the pasted text has several, the first one is used and the text
  around it is ignored. The keyword is not case-sensitive; backticks and
  tildes both work.

  ````
  ```sketchdown
  button: *Save
  ```
  ````

- Pasted text without a fence is drawn only if the whole text parses without
  errors. This can be switched off in the settings.
- The component's top-left goes where the pointer is. Indentation shared by
  every line is removed first, so a spec copied from an indented list works.
- Ctrl/Cmd+Shift+V pastes as plain text, and Ctrl/Cmd+Z undoes a paste.

## Components

| Keyword (aliases) | Example | Notes |
|---|---|---|
| `button` (btn) [v2] | `button: *Save` | `*` = primary (blue) |
| `dropdown` (select, combo, combobox) [v2] | `dropdown: *Sweden \| Norway` | shows the starred or first value; width fits the longest option |
| `checkbox` (check, checkboxes) [v2] | `checkbox: [x] Email \| [ ] SMS` | stacked vertically |
| `text` (label) [v2] | `text: Role` | continuation lines become more lines of text |
| `grid` (table, datagrid) [v2] | see below | first row is the header |
| `tabs` (tab) [v2] | `tabs: A \| *B \| C` | container; empty panel 360×160 by default |
| `box` (panel, group) [v2] | `box: New user` | container with an optional title bar |
| `row` [v2] | `row:` | container, children side by side, centred vertically |
| `icon` [M3a] | `icon: search` | one icon; `(w=32)` sets its size; unknown names are an error |
| `input` (field, textbox) [M3a] | `input: Anna` | one-line field, at least 200 wide; `{icon}` allowed |
| `search` [M3a] | `search: Find users` | input with a search icon; says "Search" when empty |
| `password` [M3a] | `password: secret` | input showing one dot per character (8 when empty) |
| `textarea` [M3a] | `textarea: Notes` | multi-line field, at least 240×80; continuation lines are more text |
| `h1` (heading) [M3a] | `h1: Users` | text 1.75 times the font size; there is no bold |
| `h2` (subheading) [M3a] | `h2: Details` | text 1.375 times the font size |
| `columns` (cols) [M3a] | `columns: (w=1200, h=700)` | container; panels side by side, touching, all full height; `(gap=12)` adds space |

### Grid [v2]

```
grid
Name, Role, Salary, Active
Anna, Developer, 52 000 kr, [x]
*Erik, PM, 61 500 kr, [ ] Admin
```
- Cells split on `,`, or on `|` if any row contains `|`.
- Markdown tables work: outer pipes are stripped and `|---|` lines ignored.
- `[x]` and `[ ]` draw a checkbox, optionally followed by a label.
- Numeric-looking cells are right-aligned, except in the header.
- A leading `*` selects a row (light blue fill).

## Icons [M3a]

- `{name}` inside a label draws an icon there: `button: {plus} Add`,
  `text: {user} Signed in as Anna`. Works in `text` (on every line), `button`,
  `input`, `search`, `h1` and `h2`; more components follow as they are built.
  Unknown names stay as literal text, so `{anything}` is safe to write.
- A button with only icons is square: `button: {filter}`. With `(round)`
  it is a circle: `button: {more} (round)`.
- `icon: name` on its own line draws one icon (see the table above).
- Icons are drawn with lines in the canvas's stroke colour and roughness.
  They are a little smaller than a line of text.
- Names (case doesn't matter): search, filter, more, close, back, menu,
  home, user, users, settings, plus, edit, trash, bell, calendar, file,
  folder, star, info, check, chevron-down, chevron-right, mail, phone,
  lock, dot.

## Modifiers [M3a]

- `(fill)` stretches a component to the room its parent has:
  - in a stack (top level, `box`, `tabs`): as wide as the inside of the box
    or tab panel, or as the widest sibling at the top level;
  - in a `row` or `columns` with a known width (`(w=...)`, or it is itself
    `(fill)`): fill children share the width the others leave over. Without
    a known width they keep their natural size.
  - `button`, `dropdown`, `input`, `search`, `password`, `textarea`, `text`,
    `h1`, `h2`, `grid`, `box`, `tabs`, `row` and `columns` stretch. Inside
    `columns`, every panel also gets the full height.
    Stretched text stays left-aligned and pushes what follows to the right,
    which is how a header puts a close button at the far end:

    ```
    box: (w=420)
      row: (fill)
        text: Users (fill)
        button: Close
    ```
- `(disabled)` draws the component's lines and text grey, including
  everything inside a container. Fills keep their colour.
- `(dark)` on a `box` fills it with the dark colour and draws its text and
  icons light. Buttons, fields, dropdowns and grids inside keep their normal
  look. Example app shell:

  ```
  columns: (w=1200, h=700)
    box (dark, w=220)
      text: {home} Home
      button: {plus} New (fill)
    box (fill)
      h1: Users
    box: Details (w=320)
  ```

## Planned additions [planned]

Agree on these with the owner before building. They're listed roughly by value.

- Inputs: `radio: (o) A | ( ) B`, `toggle: [on] Wi-Fi`, `slider: 40%`.
- Text: `link: [Forgot password?]`, `paragraph: lorem` (placeholder text).
- Frames: `browser: Title | url`, `phone:`, `modal: Title`, `window:`.
- Navigation: `menu:`, `breadcrumb: Home > Users > Anna`, `list:`, `tree:`
  (indentation-based), `pagination:`.
- Feedback: `alert: Saved!`, `progress: 60%`, `tooltip:`.
- Media: `image: 320x180` (crossed placeholder), `avatar: MH`.
- Alignment in rows.
- Inline formatting in labels, as in Balsamiq: `_italic_`, `[link]`, `-disabled-`. No `*bold*`: Excalidraw text
  has no font weight (agreed 2026-10-14).
