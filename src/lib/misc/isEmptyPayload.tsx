import { UploadedFile } from '../storage/types';

export const isEmptyPayload = (files: UploadedFile[] | undefined) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return true;
  }
  const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
  return totalBytes === 0;
};
