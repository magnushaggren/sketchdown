import type { Component, NodeType } from "../types";
import { box } from "./box";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { columns } from "./columns";
import { dropdown } from "./dropdown";
import { grid } from "./grid";
import { heading } from "./heading";
import { icon } from "./icon";
import { input, textarea } from "./input";
import { row } from "./row";
import { tabs } from "./tabs";
import { text } from "./text";

const root: Component = (ctx, node, x, y) => ctx.stack(node.children, x, y, ctx.theme.gap.root);

export const COMPONENTS: Record<NodeType, Component> = {
  root,
  row,
  box,
  tabs,
  text,
  button,
  dropdown,
  checkbox,
  grid,
  icon,
  input,
  search: input,
  password: input,
  textarea,
  h1: heading,
  h2: heading,
  columns,
};
