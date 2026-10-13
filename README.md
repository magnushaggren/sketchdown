# Sketchdown

Balsamiq-style wireframes for [Excalidraw](https://excalidraw.com) inside
Obsidian. Write a short text spec and get a hand-drawn component made of
native Excalidraw elements, which you can annotate and connect like anything
else on the canvas.

```
tabs: Overview | *Users | Settings
  row:
    text: Role
    dropdown: *All roles | Developer | Project manager
  grid
  Name, Role, Active
  Anna, Developer, [x]
  *Erik, Project manager, [ ]
  row:
    button: Cancel
    button: *Save
```

Status: early development. See `docs/SYNTAX.md` for the language and
`docs/PLAN.md` for the roadmap.

## Use

Requires the [Obsidian Excalidraw plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)
2.0.0 or newer. In a drawing, run **Sketchdown: Create or edit wireframe**:

- with a Sketchdown component selected, to edit its text and redraw it in place;
- with a single text element selected, to convert it into a component;
- with nothing selected, to write a spec in a popup.

## Develop

- `npm run dev`: watch build to `main.js`
- `npm run build`: type-check and production build
- `npm test`: run the tests

## Credits

- Inspired by [Balsamiq](https://balsamiq.com).
- Syntax ideas from [Wireframy](https://github.com/divyaraj-m/wireframy) (MIT).
- Built on Excalidraw and the Obsidian Excalidraw plugin.

Licence: MIT.
