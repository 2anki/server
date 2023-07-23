export const isMarkdownFile = (fileName: string) => fileName.match(/.md$/i);

export const isHTMLFile = (fileName: string) => fileName.match(/.html$/i);

export const isZIPFile = (fileName: string) => fileName.match(/.zip$/i);

export const isPlainText = (fileName: string) => /\.txt$/i.exec(fileName);

export function hasMarkdownFileName(fileNames: string[]) {
  return fileNames.some(isMarkdownFile);
}

export const isSoundCloudURL = (url: string) => url.match(/soundcloud\.com/i);

export const isTwitterURL = (url: string) => url.match(/twitter\.com/i);

export const isVimeoURL = (url: string) => url.match(/vimeo\.com/i);

export const isFileEmbedable = (url: string) =>
  !url.startsWith('http') && !url.startsWith('data:image');
