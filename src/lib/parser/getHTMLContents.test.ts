import { describe } from 'node:test';
import { getHTMLContents } from './getHTMLContents';

describe("getHTMLContents", () => {
  test("returns html contents", () => {
    expect(getHTMLContents({contents: "<h1>html</h1>", name: "index.html"})).toBe("<h1>html</h1>")
  })
  test("returns html for markdown", () => {
    expect(getHTMLContents({contents: "# md", name: "README.md"})).toBe("<h1>md</h1>")
  })
})
