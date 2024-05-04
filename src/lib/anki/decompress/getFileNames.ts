import { File } from './types';

export const getFileNames = (files: File[]) => {
  return files.map((file) => file.name);
};
