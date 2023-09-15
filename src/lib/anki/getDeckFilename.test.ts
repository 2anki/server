import Package from '../parser/Package';
import getDeckFilename from './getDeckFilename';

test('appends missing .apkg extension', () => {
  expect(getDeckFilename('foo')).toEqual('foo.apkg');
});

test("does not append .apkg extension if it's already there", () => {
  expect(getDeckFilename('foo.apkg')).toEqual('foo.apkg');
});

test("uses package name if it's available", () => {
  expect(getDeckFilename(new Package('foo', Buffer.alloc(0)))).toEqual(
    'foo.apkg'
  );
});
