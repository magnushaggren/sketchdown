import type { Component, NodeType } from "../types";
import { avatar } from "./avatar";
import { box } from "./box";
import { button } from "./button";
import { checkbox } from "./checkbox";
import { columns } from "./columns";
import { radio, slider, toggle } from "./controls";
import { details } from "./details";
import { dropdown } from "./dropdown";
import { alert, image, progress, tooltip } from "./feedback";
import { browser, buttons, dialog, phone, windowFrame } from "./frames";
import { grid } from "./grid";
import { heading } from "./heading";
import { icon } from "./icon";
import { input, textarea } from "./input";
import { link } from "./link";
import { nav } from "./nav";
import { breadcrumb, menu, pagination, tree } from "./navigation";
import { paragraph } from "./paragraph";
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
  nav,
  avatar,
  details,
  window: windowFrame,
  dialog,
  browser,
  phone,
  buttons,
  link,
  paragraph,
  radio,
  toggle,
  slider,
  alert,
  progress,
  tooltip,
  image,
  breadcrumb,
  pagination,
  menu,
  tree,
};
