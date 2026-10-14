# Sketchdown syntax

Status markers: **[v2]** implemented in the prototype, **[M3a]** added in milestone M3a, **[M3b]** added in milestone M3b, **[planned]** not built yet.

## Structure [v2]

- One component per line: `keyword: content (options)`.
- `grid`, `tabs`, `box`, `row`, `columns` and the frames (`window`,
  `dialog`, `browser`, `phone`) may also appear without a colon.
- Indentation nests components. Anything indented deeper than a container
  line (`tabs`, `box`, `row`, `columns` and the frames) goes inside it. Tabs count as 4 spaces.
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

## Wireframes in notes [M4]

- A fenced block with the info string `sketchdown` in a note is drawn as a
  wireframe in reading view and live preview. Errors are listed under it,
  with line numbers, and the rest is still drawn.
- Notes have no canvas, so blocks use the fixed style from the settings
  (stroke colour, font, sloppiness), along with the settings' colours, font
  size and gaps. A wide wireframe shrinks to fit the note. In a dark theme
  the colours are inverted, as Excalidraw does.
- The font is Excalidraw's when the Excalidraw plugin has loaded it, and a
  handwriting fallback otherwise.
- "Copy for Excalidraw" under a block copies it as a fenced block; paste it
  into a drawing to draw it there.
- The command "Send wireframe to Excalidraw", with the cursor in a block,
  draws it in the middle of the drawing used most recently, ready to edit
  like any other wireframe.
- A setting turns the drawing of blocks off; they then show as text.

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
| `grid` (table, datagrid) [v2] | `grid`, then rows like `Anna, Developer` | first row is the header |
| `tabs` (tab) [v2] | `tabs: A \| *B \| C` | container; empty panel 360×160 by default; `(segmented)` and `(underline)` styles below |
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
| `nav` (navigation) [M3a] | `nav: {home} Home \| *{users} Users \| - \| Log out` | vertical list; `*` marks the active item, `-` a divider; items split on `\|` only; `(dark)` adds its own dark background |
| `avatar` [M3a] | `avatar: AS` | circle with initials (a user icon when empty), twice the line height; `(w=48)` sets its size |
| `details` (properties) [M3a] | `details: {phone} Phone \| 070-123` | one row per line, `label \| value`; values line up in a second column and are grey |
| `window` [M3b] | `window: Settings` | container; see Frames below |
| `dialog` (modal) [M3b] | `dialog: Delete user?` | container; see Frames below |
| `browser` [M3b] | `browser: My app \| example.com` | container; see Frames below |
| `phone` [M3b] | `phone: Users` | container; see Frames below |
| `buttons` [M3b] | `buttons: Cancel \| *OK` | buttons side by side on the right of the parent's width; always `(fill)` |
| `link` [M3b] | `link: Forgot password?` | blue, underlined text; icons allowed |
| `paragraph` (p, lorem) [M3b] | `paragraph: lorem (lines=4)` | text wrapped to 320 wide, or `(w=...)` or `(fill)`; `lorem` or no text gives placeholder text, 4 lines unless `(lines=...)`; continuation lines join the text |
| `radio` (radios, option) [M3b] | `radio: Small \| *Medium \| Large` | stacked like checkboxes; `*` marks the chosen one, or write `(o)` and `( )`; items split on `\|` and continuation lines |
| `toggle` (switch) [M3b] | `toggle: [on] Wi-Fi \| [off] Bluetooth` | stacked switches; `[on]` or `*` is on, anything else off |
| `slider` (range) [M3b] | `slider: 40%` | track with a knob at the value (50% when missing), 200 wide, or `(w=...)` or `(fill)` |
| `alert` (message, notice) [M3b] | `alert: {info} Saved! [Undo]` | light blue box around the text; continuation lines are more lines; icons and links allowed; `(w=...)`, `(fill)` |
| `progress` [M3b] | `progress: Uploading 60%` | bar filled to the percentage (empty when missing), 200 wide, or `(w=...)` or `(fill)`; other text goes above the bar |
| `tooltip` (hint) [M3b] | `tooltip: Copied!` | small dark box with light text and a pointer below |
| `image` (img, picture) [M3b] | `image: 320x180 Team photo` | crossed placeholder, 200×120 by default; `(w=...)`, `(h=...)` and `(fill)` override the size; other text is a grey caption in the middle |
| `breadcrumb` (breadcrumbs, crumbs) [M3b] | `breadcrumb: Home > Users > Anna` | links with chevrons between; the `*` item, or else the last, is current and not a link; splits on `\|` when there is no `>`; icons allowed |
| `pagination` (pager, pages) [M3b] | `pagination: < 1 *2 3 … 10 >` | items split on spaces; a box per page, `*` filled; `<` `>` (or `«` `»`) are arrows; `…` or `...` has no box |
| `menu` (contextmenu) [M3b] | `menu: Copy \| Ctrl+C` | see Menus and trees below |
| `tree` [M3b] | `tree: Project` | see Menus and trees below |

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
- **[M3a]** `grid (plain)` drops the outer frame, the column lines and the
  header fill, keeping the lines between rows. `grid (striped)` fills every
  other body row. They combine: `grid (plain, striped)`.
- **[M3a]** Text cells may hold icons: `Anna, {dot} Active`.

### Tab styles [M3a]

- `tabs: ACTIVE | *INACTIVE | ALL (segmented)`: one bordered strip split
  into parts, the active part filled. With `(w=...)` or `(fill)` the parts
  share the width.
- `tabs: *CONTENT | FILES (underline)`: labels on a thin line, the active
  one underlined thickly and the others grey.
- Neither style has a panel frame. Children, if any, are stacked below.
- Labels may hold icons: `tabs: {file} Files | *{users} People (underline)`.

## Frames [M3b]

Frames are containers like `box`: children stack inside with the same
padding, and `(w=...)`, `(h=...)`, `(fill)` and `(disabled)` work the same
way. They are white, so they cover what lies under them.

- `window: Settings`: a title bar with minimise, maximise and close controls.
  At least 320 wide.
- `dialog: Delete user?` (alias `modal`): a title bar with a close control,
  and a grey shadow to the bottom right. At least 280 wide.
- `browser: My app | example.com/users`: a tab with the title, then back and
  forward arrows and an address field. Without a title, `browser: | url`,
  there is no tab. At least 480 wide.
- `phone: Users`: a rounded phone, 375×667 unless `(w=...)` or `(h=...)`
  says otherwise, with a status bar and a home indicator. The text, if any,
  is the title of an app bar under the status bar.
- `buttons: Cancel | *Delete` puts buttons on the right, as in a dialog
  footer:

  ```
  dialog: Delete user?
    text: Anna Svensson will lose access.
    buttons: Cancel | *Delete
  ```

## Inline formatting [M3b]

Inside any label (`text`, `button`, headings, `nav`, tabs, `details`, grid
cells and the like):

- `[text]` is a link: blue and underlined. `text: Forgot [password]?`
  Checkbox and toggle marks (`[x]`, `[ ]`, `[on]`, `[off]`) are not links.
- `-text-` is grey, as for something disabled: `text: -Archived- users`.
  The dashes need a space, the line's start or end, or punctuation after
  them, so `070-123 45-67` and `2021-03-01` stay as written.
- There is no italic or bold: Excalidraw text has neither.
- In a `(disabled)` component links are grey too.
- `paragraph` text is not formatted.

## Menus and trees [M3b]

A menu has one item per line: the text after `menu:`, then continuation
lines.

```
menu: Cut | Ctrl+X
*Copy | Ctrl+C
-Paste- | Ctrl+V
-
[x] Show ruler
Zoom >
```

- `label | shortcut`: the shortcut is grey and right-aligned.
- `*` highlights an item, `-` on its own line is a divider, and `-text-`
  greys an item out.
- `[x]` and `[ ]` put a tick, or room for one, in a column on the left.
- A trailing `>` draws a submenu arrow.
- At least 160 wide; `(w=...)` widens it.

A tree takes its levels from the indentation of its lines. Any consistent
step works: the smallest indentation is the first level, the next one the
second, and so on. The text after `tree:` is the root, one level above the
rest.

```
tree: {folder} Project
  - {folder} src
    *{file} index.ts
    {file} main.ts
  + {folder} docs
```

- `+ name` is a closed folder (a right chevron), `- name` an open one (a down
  chevron). The space after the sign is needed, so `-old-` is grey text.
- `*` selects a row (light blue across the tree's width).
- Lines in a tree are continuation lines, so a line that starts with a
  keyword (like `row` or `box: x`) is read as a component, not an item.

## Icons [M3a]

- `{name}` inside a label draws an icon there: `button: {plus} Add`,
  `text: {user} Signed in as Anna`. Works in `text` (on every line), `button`,
  `input`, `search`, headings, `nav`, `tabs`, `details`, grid cells, `link`,
  `radio`, `toggle`, `alert`, `progress`, `tooltip`, `image` captions,
  `breadcrumb`, `menu` and `tree`. Not in `checkbox`, `dropdown`,
  `password`, `textarea`, `paragraph`, `pagination` or frame titles.
  The same goes for `[link]` and `-grey-` text.
  Unknown names stay as literal text, so `{anything}` is safe to write.
- A button with only icons is square: `button: {filter}`. With `(round)`
  it is a circle: `button: {more} (round)`.
- `icon: name` on its own line draws one icon (see the table above).
- Icons are drawn with lines in the canvas's stroke colour and roughness.
  They are a little smaller than a line of text.
- Names (case doesn't matter): search, filter, more, close, back, menu,
  home, user, users, settings, plus, edit, trash, bell, calendar, file,
  folder, star, info, check, chevron-down, chevron-right, chevron-left, chevron-up, mail, phone,
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
- `(dark)` on a `box` or `nav` fills it with the dark colour and draws its text and
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

- `list:` (a plain list of items).
- Alignment in rows.
