import { EXAMPLE } from "../../src/constants";

const lines = (...l: string[]) => l.join("\n");

export const NEW_USER = lines(
  "box: New user",
  "  row:",
  "    text: Name",
  "    dropdown: *Anna | Erik",
  "  row:",
  "    text: Role",
  "    dropdown: Developer | *Project manager | Designer",
  "  checkbox: [x] Email me | [ ] Text me",
  "  row:",
  "    button: Cancel",
  "    button: *Save",
);

/** v2 specs that must parse without errors. */
export const VALID_SPECS: Record<string, string> = {
  example: EXAMPLE,
  "new user form": NEW_USER,

  // every component with no content
  "empty button": "button:",
  "empty dropdown": "dropdown:",
  "empty checkbox": "checkbox:",
  "empty text": "text:",
  "empty grid": "grid",
  "empty tabs": "tabs",
  "empty box": "box",
  "empty row": "row:",
  "empty box with title": "box: Settings",

  // simple components
  "button plain and primary": lines("button: Cancel", "button: *Save", "button: * Spaced"),
  "button with size": "button: OK (w=200, h=60)",
  "dropdown first is default": "dropdown: Sweden | Norway | Denmark",
  "dropdown starred": "dropdown: Sweden | *Norway | Denmark",
  "dropdown trailing star": "dropdown: Sweden, Norway*, A much longer option than the others",
  "dropdown with width": "dropdown: a | b (w=300)",
  "dropdown continuation": lines("dropdown: One", "*Two", "Three"),
  "checkbox items": "checkbox: [x] Email me | [ ] Text me | [X] Call me | [] Nothing | Plain",
  "checkbox keeps commas": "checkbox: [x] Email, please | [ ] SMS",
  "checkbox continuation": lines("checkbox: [x] One", "[ ] Two", "[x]"),
  "text multi-line": lines("text: First line", "second line, a bit longer", "third"),
  aliases: lines(
    "btn: A",
    "select: B | C",
    "combo: D",
    "combobox: E",
    "check: [x] F",
    "checkboxes: [ ] G",
    "label: H",
    "tab: I | J",
    "panel: K",
    "group: L",
  ),
  "upper-case keywords": lines("BUTTON: Shout", "Text : spaced colon", "GRID", "A, B"),
  "top-level stack": lines("text: Title", "button: One", "", "dropdown: x | y", "checkbox: [x] z"),

  // grid
  "grid basic": lines(
    "grid",
    "Name, Role, Salary, Active",
    "Anna, Developer, 52 000 kr, [x]",
    "*Erik, PM, 61 500 kr, [ ] Admin",
  ),
  "grid alias with header on the line": lines("table: Id, Amount", "1, 12.50", "2, -3%", "3, $400"),
  "grid pipes": lines(
    "datagrid",
    "Name | Address | Total",
    "Anna | Main St 1, Lund | 1 200",
    "* Erik | Hill Rd 2, Malmö | 99",
  ),
  "grid markdown table": lines(
    "grid",
    "| Name | Qty | Done |",
    "|------|----:|:----:|",
    "| Bolt | 12 | [x] |",
    "| Nut | 7 | [ ] |",
  ),
  "grid uneven rows": lines("grid", "A, B, C", "1", "2, 3", "*4, 5, 6, 7"),
  "grid starred header": lines("grid", "*Head, Two", "a, b"),
  "grid numeric header": lines("grid", "2023, 2024", "10, 20", "x, 30:15"),
  "grid checks": lines("grid", "On, Label", "[x], [x] Yes", "[ ], [ ] No", "[], plain"),
  "grid one row": lines("grid", "Only, Header"),
  "grid deeper continuation": lines("box: Data", "  grid", "    A, B", "    1, 2"),

  // containers
  "tabs first selected": "tabs: *One | Two | Three",
  "tabs last selected": "tabs: One | Two | *Three",
  "tabs none starred": "tabs: One, Two",
  "tabs with size": "tabs: A | *B (w=500, h=220)",
  "tabs with size and children": lines("tabs: A | *B (w=500, h=220)", "  button: Go"),
  "tabs small size with children": lines("tabs: A (w=10, h=10)", "  text: Wider than ten pixels"),
  "tabs continuation": lines("tabs: One", "Two | *Three", "  text: inside"),
  "box with size": "box: Title (w=300, h=200)",
  "box small size with children": lines("box: T (w=10, h=10)", "  button: A wide button label"),
  "box no title with children": lines("box", "  text: Hello", "  button: OK"),
  "box long title": lines("box: A very long title that is wider than the content", "  text: x"),
  "row mixed heights": lines(
    "row:",
    "  text: one",
    "  button: Two",
    "  checkbox: [x] a | [ ] b | [x] c",
    "  grid",
    "  A, B",
    "  1, 2",
  ),
  "row bare": lines("row", "  button: A", "  button: B"),
  nested: lines(
    "box: Outer",
    "  tabs: *First | Second",
    "    box: Inner",
    "      row:",
    "        text: Deep",
    "        row:",
    "          button: A",
    "          button: *B",
    "    text: After inner",
    "  button: Last",
  ),
  "dedent to an earlier level": lines(
    "box: One",
    "  row:",
    "    button: A",
    "  button: B",
    "button: C",
  ),

  // whitespace
  "tab indentation": lines("box: Tabs", "\trow:", "\t\tbutton: A", "\t\tbutton: B", "\ttext: End"),
  "mixed tabs and spaces": lines(
    "box: Mixed",
    "\trow:",
    "        button: Deeper than one tab",
    "    button: Level with one tab",
  ),
  "windows line endings": "box: CRLF\r\n  button: A\r\n  button: B\r\n",
  "surrounding blank lines": lines("", "", "button: A", "", "", "button: B", ""),
};

/** Specs that produce errors; the rest of each spec is still drawn. */
export const ERROR_SPECS: Record<string, string> = {
  "child under a non-container": lines("button: A", "  button: B", "button: C"),
  "child under a grid": lines("grid", "A, B", "  text: nope"),
  "unknown first line": lines("hello world", "button: A"),
  "unknown after blank line": lines("button: A", "", "what is this", "button: B"),
  "keyword that needs a colon": lines("button", "text", "box"),
  "options without a colon": "box (w=50)",
  "nothing drawable": lines("just some words", "", "more words"),
  empty: "",
};

export const ALL_SPECS: Record<string, string> = { ...VALID_SPECS, ...ERROR_SPECS };
