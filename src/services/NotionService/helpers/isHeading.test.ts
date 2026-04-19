import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isHeading } from './isHeading';

function block(type: string): BlockObjectResponse {
  return {
    object: 'block',
    id: 'b',
    type,
    has_children: false,
    archived: false,
  } as unknown as BlockObjectResponse;
}

describe('isHeading', () => {
  test.each([
    ['heading_1', true],
    ['heading_2', true],
    ['heading_3', true],
    ['heading_4', true],
    ['toggle', false],
    ['paragraph', false],
  ])('%s → %s', (type, expected) => {
    expect(isHeading(block(type))).toBe(expected);
  });
});
