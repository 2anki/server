import Package from '../parser/Package';
import getDeckFilename from './getDeckFilename';

test('appends missing .apkg extension', () => {
  expect(getDeckFilename('foo')).toEqual('foo.apkg');
});

test("does not append .apkg extension if it's already there", () => {
  expect(getDeckFilename('foo.apkg')).toEqual('foo.apkg');
});

test("uses package name if it's available", () => {
  expect(getDeckFilename(new Package('foo'))).toEqual('foo.apkg');
});

test('replaces forward slashes in the name with dashes', () => {
  expect(getDeckFilename('Red Flags / Urgent Referral Criteria')).toEqual(
    'Red Flags - Urgent Referral Criteria.apkg'
  );
});

test('replaces backslashes with dashes', () => {
  expect(getDeckFilename('a\\b\\c')).toEqual('a-b-c.apkg');
});

test('replaces null bytes with dashes', () => {
  expect(getDeckFilename('a\0b')).toEqual('a-b.apkg');
});
