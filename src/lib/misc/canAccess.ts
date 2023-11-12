const MAX_FILE_NAME_LENGTH = 255;

export const canAccess = (thePath: string, basePath?: string) => {
  console.log('canAccess', thePath, basePath);

  if (thePath.includes('..')) {
    return false;
  }

  if (thePath.includes('~')) {
    return false;
  }

  if (basePath) {
    return thePath.startsWith(basePath);
  }

  if (thePath.length >= MAX_FILE_NAME_LENGTH) {
    return false;
  }

  return /^[\w\-. ]+$/.test(thePath);
};
