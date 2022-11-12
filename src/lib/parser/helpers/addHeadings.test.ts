import addHeadings from './addHeadings';

describe('addHeadings', () => {
  test('should add headings to the array', () => {
    expect(addHeadings(['heading'])).toEqual([
      'heading_1',
      'heading_2',
      'heading_3',
    ]);
  });
  test('should not add headings', () => {
    expect(addHeadings(['page'])).toEqual(['page']);
  });
});
