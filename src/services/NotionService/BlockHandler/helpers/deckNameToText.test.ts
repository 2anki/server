import { toText } from './deckNameToText';

test('removes html tags from deck name', () => {
  expect(toText('<span class=icon>😺</span>HTML test::innerText')).toBe(
    '😺HTML test::innerText'
  );
});
