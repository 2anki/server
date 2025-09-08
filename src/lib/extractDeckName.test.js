"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extractDeckName_1 = require("./extractDeckName");
const createInput = (name, pageIcon, decksCount, pageEmoji) => ({
    name,
    pageIcon,
    decksCount,
    settings: { pageEmoji },
});
const createExpectedOutput = (name, pageIcon, pageEmoji) => {
    if (pageIcon === null || name.includes(pageIcon)) {
        return name;
    }
    return pageEmoji === 'first_emoji'
        ? `${pageIcon} ${name}`
        : `${name} ${pageIcon}`;
};
const testCases = [
    {
        description: 'should return the correct deck name when pageIcon is null',
        input: createInput('Default::My Deck', null, 0, 'first_emoji'),
        expected: 'Default::My Deck',
    },
    {
        description: 'should return the name with pageIcon prefixed when settings.pageEmoji is "first_emoji"',
        input: createInput('My Deck', 'Default', 0, 'first_emoji'),
        expected: 'Default My Deck',
    },
    {
        description: 'should return the name with pageIcon suffixed when settings.pageEmoji is not "first_emoji"',
        input: createInput('My Deck', 'Default', 0, 'last_emoji'),
        expected: 'My Deck Default',
    },
    {
        description: 'should handle names with "::" correctly',
        input: createInput('Default::My Deck', 'Default', 0, 'first_emoji'),
        expected: 'Default::My Deck',
    },
    {
        description: 'should return the original name if pageIcon is included in the name',
        input: createInput('Default::My Deck', 'Default', 1, 'first_emoji'),
        expected: 'Default::My Deck',
    },
    {
        description: 'should handle newlines in the deck name correctly',
        input: createInput('Default\nMy Deck', 'Default', 0, 'first_emoji'),
        expected: 'Default My Deck',
    },
];
describe('extractDeckName', () => {
    testCases.forEach(({ description, input, expected }) => {
        it(description, () => {
            expect((0, extractDeckName_1.extractName)(input)).toBe(expected);
        });
    });
});
//# sourceMappingURL=extractDeckName.test.js.map