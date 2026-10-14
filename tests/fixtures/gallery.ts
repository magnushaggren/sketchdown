// One spec that uses every component and option, rendered to
// docs/gallery.svg by tests/gallery.test.ts. Add each new component here.

const lines = (...l: string[]) => l.join("\n");

export const GALLERY = lines(
  "text: Sketchdown gallery",
  "row:",
  "  button: Cancel",
  "  button: *Save",
  "  button: Disabled (disabled)",
  "  dropdown: *Sweden | Norway | Denmark",
  "  checkbox: [x] Email | [ ] SMS",
  "tabs: Overview | *Users | Settings",
  "  row:",
  "    text: Role",
  "    dropdown: *All roles | Developer",
  "  grid (fill)",
  "  Name, Role, Salary, Active",
  "  Anna, Developer, 52 000 kr, [x]",
  "  *Erik, Project manager, 61 500 kr, [ ]",
  "row:",
  "  box: New user (w=280)",
  "    row: (fill)",
  "      text: Header (fill)",
  "      button: X",
  "    checkbox: [x] Active",
  "    button: *Create (fill)",
  "  box (disabled)",
  "    text: A disabled box",
  "    button: Inside",
);
