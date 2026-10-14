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
  {
    name: "Input",
    description: "One-line text field",
    text: "input: Anna Svensson",
  },
  { name: "Search field", description: "Field with a search icon", text: "search: Search users" },
  { name: "Password", description: "Field with masked text", text: "password: secret" },
  {
    name: "Text area",
    description: "Multi-line field; more lines below it are more text",
    text: lines("textarea: Notes", "Second line"),
  },
  { name: "Heading", description: "h1 is the big one, h2 smaller", text: "h1: Users" },
  { name: "Icon", description: "One icon; {name} also works inside labels", text: "icon: bell" },
  {
    name: "Icon buttons",
    description: "Square, or round with (round)",
    text: lines("row:", "  button: {filter}", "  button: {more} (round)", "  button: {plus} Add"),
  },
  {
    name: "Page header",
    description: "Title on the left, close button on the right",
    text: lines(
      "box: (w=600)",
      "  row: (fill)",
      "    h1: Users (fill)",
      "    button: {close} (round)",
    ),
  },
  {
    name: "Segmented control",
    description: "Joined options, the starred one active",
    text: "tabs: *ACTIVE | INACTIVE | ALL (segmented)",
  },
  {
    name: "Underlined tabs",
    description: "Tabs without a frame, the active one underlined",
    text: "tabs: *CONTENT | FILES (underline)",
  },
  {
    name: "Plain table",
    description: "Borderless grid with striped rows and status dots",
    text: lines(
      "grid (plain, striped)",
      "Name, Role, Status",
      "Anna, Developer, {dot} Active",
      "*Erik, Project manager, {dot} Active",
      "Lisa, Designer, Away",
    ),
  },
  {
    name: "Navigation",
    description: "Vertical menu with icons; * is active, - a divider",
    text: "nav: {home} Home | *{users} Users | {settings} Settings | - | {back} Log out",
  },
  {
    name: "User block",
    description: "Avatar with a name beside it",
    text: lines("row:", "  avatar: AS", "  text: Anna Svensson"),
  },
  {
    name: "Detail list",
    description: "Rows of label | value",
    text: lines(
      "details: {mail} E-mail | anna@example.com",
      "{phone} Phone | 070-123 45 67",
      "{lock} Role | Administrator",
    ),
  },
  {
    name: "Link",
    description: "Blue, underlined text; [text] does the same inside any label",
    text: "link: Forgot password?",
  },
  {
    name: "Inline formatting",
    description: "[link] is a link, -text- is grey",
    text: "text: Read the [terms] or -skip for now-",
  },
  {
    name: "Paragraph",
    description: "Wrapped text; lorem gives placeholder text",
    text: "paragraph: lorem (lines=4)",
  },
  {
    name: "Window",
    description: "Desktop window with a title bar; indent the content under it",
    text: lines("window: Settings", "  text: Window content"),
  },
  {
    name: "Dialog",
    description: "Pop-up with a shadow and buttons on the right",
    text: lines(
      "dialog: Delete user?",
      "  text: Anna Svensson will lose access.",
      "  buttons: Cancel | *Delete",
    ),
  },
  {
    name: "Browser",
    description: "Browser window: title | address",
    text: lines("browser: My app | example.com/users", "  h1: Users"),
  },
  {
    name: "Phone",
    description: "Phone screen; the text is the app bar title",
    text: lines("phone: Users", "  search: (fill)", "  button: *{plus} New user (fill)"),
  },
  {
    name: "Buttons",
    description: "Buttons on the right, as in a dialog footer",
    text: "buttons: Cancel | *OK",
  },
  {
    name: "App shell",
    description: "Dark sidebar, main area and detail panel, full height",
    text: lines(
      "columns: (w=1200, h=700)",
      "  box (dark, w=220)",
      "    nav: {home} Home | *{users} Users (fill)",
      "  box (fill)",
      "    h1: Users",
      "  box: Details (w=320)",
      "    text: Select a user",
    ),
  },
  {
    name: "Portal screen",
    description: "App shell with navigation, a filtered table and details",
    text: lines(
      "columns: (w=1280, h=720)",
      "  box (dark, w=240)",
      "    row:",
      "      avatar: AS",
      "      text: Anna Svensson",
      "    nav: {home} Home | *{users} Users | {settings} Settings | - | {back} Log out (fill)",
      "    button: *{plus} New user (fill)",
      "  box (fill)",
      "    row: (fill)",
      "      h1: Users (fill)",
      "      button: {close} (round)",
      "    row: (fill)",
      "      tabs: *ACTIVE | INACTIVE | ALL (segmented)",
      "      search: Search users (fill)",
      "      button: {filter} (round)",
      "      button: {more} (round)",
      "    grid (plain, striped, fill)",
      "    Name, Role, E-mail, Status",
      "    Anna Svensson, Developer, anna@example.com, {dot} Active",
      "    *Erik Berg, Project manager, erik@example.com, {dot} Active",
      "    Lisa Holm, Designer, lisa@example.com, Away",
      "  box (w=360)",
      "    row: (fill)",
      "      h2: Erik Berg (fill)",
      "      button: {close} (round)",
      "    tabs: *CONTENT | FILES (underline)",
      "    details: {mail} E-mail | erik@example.com",
      "    {phone} Phone | 070-123 45 67",
      "    {calendar} Since | 2021-03-01",
      "    {lock} Role | Project manager",
      "    button: *Save (fill)",
    ),
  },
];
