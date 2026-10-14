import type { Component, NodeType } from "../types";
import { box } from "./box";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { dropdown } from "./dropdown";
import { grid } from "./grid";
import { icon } from "./icon";
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
};
