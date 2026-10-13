export interface Snippet {
  name: string;
  /** One line shown under the name in the picker. */
  description: string;
  /** Spec text, starting at indentation 0. */
  text: string;
}

const lines = (...l: string[]) => l.join("\n");

/** Starting points for the quick-insert palette: every component, then common combinations. */
export const SNIPPETS: Snippet[] = [
  { name: "Button", description: "A plain button", text: "button: Cancel" },
  { name: "Primary button", description: "* makes it the blue one", text: "button: *Save" },
  {
    name: "Dropdown",
    description: "Shows the starred value",
    text: "dropdown: *All roles | Developer | Project manager",
  },
  { name: "Checkbox", description: "[x] is ticked, [ ] is not", text: "checkbox: [x] Remember me" },
  {
    name: "Checkbox list",
    description: "Several checkboxes, stacked",
    text: "checkbox: [x] Email | [ ] SMS | [ ] Push",
  },
  { name: "Text", description: "A label or a line of text", text: "text: Label" },
  {
    name: "Grid",
    description: "Table: the first row is the header, * selects a row",
    text: lines(
      "grid",
      "Name, Role, Active",
      "Anna, Developer, [x]",
      "*Erik, Project manager, [ ]",
    ),
  },
  {
    name: "Tabs",
    description: "Tab strip with a panel; indent the content under it",
    text: lines("tabs: Overview | *Details | History", "  text: Tab content"),
  },
  {
    name: "Box",
    description: "Framed panel with a title; indent the content under it",
    text: lines("box: Title", "  text: Box content"),
  },
  {
    name: "Row",
    description: "Puts the indented components side by side",
    text: lines("row:", "  text: Label", "  button: Action"),
  },
  {
    name: "Labelled dropdown",
    description: "A label and a dropdown on one line",
    text: lines("row:", "  text: Role", "  dropdown: *Developer | Project manager"),
  },
  {
    name: "Button row",
    description: "Cancel and a primary button",
    text: lines("row:", "  button: Cancel", "  button: *Save"),
  },
  {
    name: "Form in a box",
    description: "Fields, options and buttons inside a titled box",
    text: lines(
      "box: New user",
      "  row:",
      "    text: Role",
      "    dropdown: *Developer | Project manager",
      "  checkbox: [x] Active | [ ] Administrator",
      "  row:",
      "    button: Cancel",
      "    button: *Create",
    ),
  },
  {
    name: "Filter bar and grid",
    description: "A row of filters above a table",
    text: lines(
      "row:",
      "  text: Role",
      "  dropdown: *All roles | Developer | Project manager",
      "  checkbox: [x] Show inactive",
      "grid",
      "Name, Role, Active",
      "Anna, Developer, [x]",
      "*Erik, Project manager, [ ]",
    ),
  },
  {
    name: "Tabbed screen",
    description: "Tabs with filters, a grid and buttons",
    text: lines(
      "tabs: Overview | *Users | Settings",
      "  row:",
      "    text: Role",
      "    dropdown: *All roles | Developer | Project manager",
      "    checkbox: [x] Show inactive",
      "  grid",
      "  Name, Role, Active",
      "  Anna, Developer, [x]",
      "  *Erik, Project manager, [ ]",
      "  row:",
      "    button: Cancel",
      "    button: *Save",
    ),
  },
];
