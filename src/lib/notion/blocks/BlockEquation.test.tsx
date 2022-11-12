import BlockEquation from './BlockEquation';

describe('BlockEquation', () => {
  test('MathJax transform', () => {
    const expected = '\\(sqrt{x}\\)';
    const input = {
      type: 'equation',
      equation: {
        expression: 'sqrt{x}',
      },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default',
      },
      plain_text: 'sqrt{x}',
      href: null,
    };
    /* @ts-ignore */
    expect(BlockEquation(input)).toBe(expected);
  });
});
