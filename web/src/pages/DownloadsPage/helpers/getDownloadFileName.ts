import { isServerBundle } from './isServerBundle';

export const getDownloadFileName = (fileName: string) => {
  if (fileName.toLowerCase().endsWith('.apkg') || isServerBundle(fileName)) {
    return fileName;
  }
  return `${fileName}.apkg`;
};
