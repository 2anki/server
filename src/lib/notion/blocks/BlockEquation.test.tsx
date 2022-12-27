import BlockEquation from './BlockEquation';
import { EquationBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

describe('BlockEquation', () => {
  test('MathJax transform', () => {
    const expected = '\\(sqrt{x}\\)';
    const input = {
      object: 'block',
      id: 'be5503f9-7544-460d-a500-fdc3c04431e8',
      parent: {
        type: 'block_id',
        block_id: '0d75beab-5fbe-46b3-aeaa-bc64e765bb41',
      },
      created_time: '2022-12-25T19:32:00.000Z',
      last_edited_time: '2022-12-25T19:32:00.000Z',
      created_by: {
        object: 'user',
        id: 'aa',
      },
      last_edited_by: {
        object: 'user',
        id: 'aa',
      },
      has_children: false,
      archived: false,
      type: 'equation',
      equation: { expression: '\\(sqrt{x}\\)' },
    } as EquationBlockObjectResponse;
    expect(BlockEquation(input)).toBe(expected);
  });
});
