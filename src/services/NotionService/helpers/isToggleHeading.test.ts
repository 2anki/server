import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isToggleHeading } from './isToggleHeading';

function headingBlock(
  type: 'heading_1' | 'heading_2' | 'heading_3' | 'heading_4',
  isToggleable: boolean
): BlockObjectResponse {
  return {
    object: 'block',
    id: 'b',
    type,
    has_children: true,
    archived: false,
    [type]: {
      rich_text: [],
      color: 'default',
      is_toggleable: isToggleable,
    },
  } as unknown as BlockObjectResponse;
}

describe('isToggleHeading', () => {
  test('heading_2 with is_toggleable=true is a toggle heading', () => {
    expect(isToggleHeading(headingBlock('heading_2', true))).toBe(true);
  });

  test.each<['heading_1' | 'heading_2' | 'heading_3' | 'heading_4']>([
    ['heading_1'],
    ['heading_2'],
    ['heading_3'],
    ['heading_4'],
  ])('%s with is_toggleable=true is a toggle heading', (type) => {
    expect(isToggleHeading(headingBlock(type, true))).toBe(true);
  });

  test('heading_2 with is_toggleable=false is NOT a toggle heading', () => {
    expect(isToggleHeading(headingBlock('heading_2', false))).toBe(false);
  });

  test('regular toggle block is NOT classified as a toggle heading', () => {
    const toggle = {
      object: 'block',
      id: 'b',
      type: 'toggle',
      has_children: true,
      archived: false,
      toggle: { rich_text: [], color: 'default' },
    } as unknown as BlockObjectResponse;
    expect(isToggleHeading(toggle)).toBe(false);
  });
});
