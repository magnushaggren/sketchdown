# Sketchdown syntax

Status markers: **[v2]** implemented in the prototype, **[planned]** not built yet.

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
- Options at the end of a line, in brackets: `(w=500, h=220)`. Only numeric
  `k=v` pairs.
- `*` marks the selected or active item: tab, dropdown value, grid row, or
  primary button.
- Lists split on `|`, and on `,` if no `|` is present. Exception: checkbox
  items split on `|` only.

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

## Planned additions [planned]

Agree on these with the owner before building. They're listed roughly by value.

- Inputs: `input: Placeholder`, `password:`, `textarea:`, `search:`,
  `radio: (o) A | ( ) B`, `toggle: [on] Wi-Fi`, `slider: 40%`.
- Text: `heading: Title` or `h1:`/`h2:`, `link: [Forgot password?]`,
  `paragraph: lorem` (placeholder text).
- Frames: `browser: Title | url`, `phone:`, `modal: Title`, `window:`.
- Navigation: `menu:`, `breadcrumb: Home > Users > Anna`, `list:`, `tree:`
  (indentation-based), `pagination:`.
- Feedback: `alert: Saved!`, `progress: 60%`, `tooltip:`.
- Media: `image: 320x180` (crossed placeholder), `avatar: MH`, `icon: name`.
- Modifiers, applying to any component: `(disabled)`, `(fill)` (take the
  remaining width of the parent), and alignment in rows. These need flag
  options in addition to numeric `k=v`.
- Inline formatting in labels, as in Balsamiq: `*bold*`, `_italic_`, `[link]`,
  `-disabled-`.
