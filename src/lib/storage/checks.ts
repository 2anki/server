export function hasMarkdownFileName(fileNames: string[]) {
  return fileNames.some((fileName) => fileName.match(/.md$/i));
}
