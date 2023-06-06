import getSubDeckName from './getSubDeckName';
import { CHILD_PAGE_MOCK, HEADING_MOCK } from './mocks';

describe('getSubDeckName', () => {
  it.each([
    ['name from title', { title: 'cool' }, 'cool'],
    ['child page', CHILD_PAGE_MOCK, 'Basic blocks'],
    ['child page', HEADING_MOCK, 'Blocks'],
  ])('%s', (_, input, expected) => {
    expect(getSubDeckName(input)).toBe(expected);
  });
});
