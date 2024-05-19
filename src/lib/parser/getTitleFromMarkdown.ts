export function getTitleFromMarkdown(contents: string | undefined) {
  return contents?.split('\n')[0].replace(/^#\s/, '');
}
