import { describe, expect, it } from "vitest";
import { extractSpec } from "../src/core";

const plain = (text: string) => extractSpec(text, { plain: true });
const fencedOnly = (text: string) => extractSpec(text, { plain: false });

describe("fenced blocks", () => {
  it("takes the content of a sketchdown block", () => {
    expect(fencedOnly("```sketchdown\nbutton: A\n```")).toBe("button: A");
  });

  it("takes the first block from surrounding text", () => {
    const note = "Intro\n\n```sketchdown\nrow:\n  button: A\n```\n\n```sketchdown\ntext: B\n```";
    expect(fencedOnly(note)).toBe("row:\n  button: A");
  });

  it("accepts tildes, longer fences, spaces and any case in the keyword", () => {
    expect(fencedOnly("~~~ Sketchdown \nbutton: A\n~~~")).toBe("button: A");
    expect(fencedOnly("````sketchdown\nbutton: A\n```\n````")).toBe("button: A\n```");
  });

  it("removes indentation shared by every line", () => {
    expect(fencedOnly("  ```sketchdown\n    row:\n      button: A\n  ```")).toBe(
      "row:\n  button: A",
    );
  });

  it("reads to the end when the block is not closed", () => {
    expect(fencedOnly("```sketchdown\nbutton: A\n")).toBe("button: A");
  });

  it("returns the content even if it has errors, so they get reported", () => {
    expect(fencedOnly("```sketchdown\nnonsense\n```")).toBe("nonsense");
  });

  it("ignores empty blocks and other languages", () => {
    expect(fencedOnly("```sketchdown\n\n```")).toBeNull();
    expect(plain("```js\nbutton: A\n```")).toBeNull();
    expect(fencedOnly("```sketchdownish\nbutton: A\n```")).toBeNull();
  });

  it("accepts Windows line endings", () => {
    expect(fencedOnly("```sketchdown\r\nbutton: A\r\nbutton: B\r\n```")).toBe(
      "button: A\nbutton: B",
    );
  });
});

describe("plain specs", () => {
  it("takes text that parses without errors", () => {
    expect(plain("tabs: A | *B\n  button: Save")).toBe("tabs: A | *B\n  button: Save");
  });

  it("trims blank lines and shared indentation", () => {
    expect(plain("\n\n    grid\n    a, b\n\n")).toBe("grid\na, b");
  });

  it("rejects text with any error", () => {
    expect(plain("button: A\nsome prose")).toBe("button: A\nsome prose"); // continuation, no error
    expect(plain("Hello there\nbutton: A")).toBeNull();
    expect(plain("button: A\n\nsome prose")).toBeNull();
  });

  it("rejects ordinary text", () => {
    expect(plain("Note: remember the milk")).toBeNull();
    expect(plain("https://example.com")).toBeNull();
    expect(plain("")).toBeNull();
    expect(plain("   \n ")).toBeNull();
  });

  it("is off when plain is false", () => {
    expect(fencedOnly("button: A")).toBeNull();
  });
});
