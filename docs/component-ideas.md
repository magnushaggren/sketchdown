# Component ideas

Gaps found by turning real screenshots into specs (M6). Each entry says
what the UI shows, how it is drawn today and a possible syntax. Counts are
occurrences in the trial screens. Rank and agree on these before building;
see PLAN.md.

Sources so far (2026-10-15):

- **Desktop forms:** two detail forms from a dense desktop line-of-business
  app (grouped label/field forms, three columns, a tab strip and a
  rich-text editor below). Converted by the skill in a fresh session.
- **Desktop grids:** a list screen from the same app (toolbar, grid,
  master/detail split). Looked at, not converted.
- **Web portal:** three screens from a Material-style admin portal (icon
  rail, underline tabs, filter chips, table, side panel, cards). One
  converted by hand during M6 step 2.

## Ranked candidates

| # | Component | Seen as | Drawn today as | Count | Possible syntax |
|---|---|---|---|---|---|
| 1 | Form with aligned labels | labels in a fixed column, fields lined up; sometimes two pairs per row | `row:` with `text:` and a `(fill)` field; labels ragged | 41 | `form:` container with `field: Label \| input: value`, or `(label=200)` |
| 2 | Required or invalid marker | red error icon inside required, empty fields | not drawn | 14 | `(required)` flag on fields |
| 3 | Collapsible group box | group box with a chevron; collapsed ones show only the title | `box: Title`; collapsed as an empty box | 15 | `box: Journal (collapsible)`, `(collapsed)` |
| 4 | Borderless stack, top alignment | several group boxes stacked in a column; columns of different heights aligned at the top | wrapper `box (h=...)` with a visible border | every multi-column form | `stack:` or `box (plain)`; `row (top)` |
| 5 | Empty dropdown and password | blank fields | "Select…" and 8 dots, always | many | draw nothing when the content is `(empty)` or `-` |
| 6 | Toolbar | icon+text buttons, separators, search at the far right | `row:` of buttons | every grid screen | `toolbar: {plus} Create \| -Edit- \| - \| {print} Print` |
| 7 | Rich-text editor | formatting toolbar over a large edit area | two placeholders | 1 per form | `richtext: (fill, h=300)` |
| 8 | Card | icon in a circle, title and subtitle, divider, body | `box:` | 3 | `card: {code} Capabilities \| subtitle` |
| 9 | Floating-label field | label inside the field's top border | `dropdown`, label lost | 3 | `dropdown: Virtual server (label=Type)` |
| 10 | Icon rail | narrow dark bar of icons only, accent on the active one | `nav (dark)`, about 120 wide; `w=` ignored | 3 | `nav (rail)` |
| 11 | Spacer | items pushed to the right end of a row | `text: X (fill)`; an empty one draws "Text" | many | `spacer:` or an empty `text: (fill)` that draws nothing |
| 12 | Field with a trailing button | lookup with a pencil or "…" inside the right edge; spin edit; date edit | separate button, or placeholder | 8 | trailing `{icon}` in `input`/`search`; `spin: 12` |
| 13 | Vertical split | master grid above, detail tabs below, fixed heights | stacked boxes | every grid screen | `rows:` like `columns` |
| 14 | Grid extras | filter row, group-by bar, sort arrows, status bar ("Items: 0") | not drawn | every grid screen | grid options `(filter, status)` |
| 15 | More icons | key, warning, refresh, print, database, clock, code, ban | left out or a near miss | several | add to the icon set |

## Seen once

- Ribbon-style header: a coloured group label above a page tab.
- Centred window title.
- Status field with a coloured bar on its left edge.
- Comment field that opens a multi-line editor from a dropdown button.
