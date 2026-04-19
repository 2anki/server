const headings = ['heading_1', 'heading_2', 'heading_3', 'heading_4'];

export default function addHeadings(input: string[]): string[] {
  const hasHeading = input.some((item) => item.startsWith('heading'));
  if (!hasHeading) {
    return input;
  }
  return input.filter((item) => !item.startsWith('heading')).concat(headings);
}
