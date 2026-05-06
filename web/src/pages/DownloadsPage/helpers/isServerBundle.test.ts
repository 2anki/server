import { isServerBundle } from './isServerBundle';

describe('isBundle', () => {
  test('server bundle name', () => {
    expect(
      isServerBundle('Your decks-62a104dc-2c91-4ce8-837e-d2379e523693.zip')
    ).toBe(true);
  });
});
