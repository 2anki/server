import sanitizeTags from "./sanitizeTags"

describe("sanitizeTags", () => {
    test("spaces are handled", () => {
        expect(sanitizeTags(["this tag"])).toEqual(["this-tag"])
    })
})