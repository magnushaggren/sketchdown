# First prompt for Claude Code

Open Claude Code in this folder, ideally in plan mode (Shift+Tab), and paste:

---

Read CLAUDE.md, docs/PLAN.md, docs/SYNTAX.md and the prototype in
prototype/Sketchdown.md. The prototype is a working Excalidraw script.
Treat it as the reference for behaviour and look.

Then propose a plan for milestone M0: scaffold the Obsidian plugin in
TypeScript and port the prototype into the core/adapter architecture
described in CLAUDE.md, with tests. Before you write code, list:
- the files you'll create;
- how the DrawOp types will look;
- how you'll inject text measurement;
- which tests prove parity with the prototype.

Ask me about anything in "Open questions" that blocks M0. Leave the rest
for later.

---

## Prompts for later sessions

- "Continue with the next milestone in docs/PLAN.md that's not done. Propose
  a plan first."
- "Add the `input`, `radio` and `toggle` components from SYNTAX.md
  [planned]. Write the parser tests first and update SYNTAX.md."
- "Something looks off: [screenshot]. Here's the spec: [...]. Find the cause
  in layout and add a regression test."
