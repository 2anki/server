import getHeadersFilename from './getHeadersFilename';

const mockedHeaders = new Headers();
mockedHeaders.get = () => 'My%20uber%20cool%20deck.apkg';
test('getHeadersFilename', () => {
  expect(getHeadersFilename(mockedHeaders)).toBe('My uber cool deck.apkg');
});
