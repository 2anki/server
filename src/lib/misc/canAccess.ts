const MAX_FILE_NAME_LENGTH = 255;

export const canAccess = (thePath: string, basePath?: string) => {
  console.log('canAccess', thePath, basePath);

  const normalizedPath = thePath.replaceAll('\\', '/');

  if (normalizedPath.includes('..')) {
    return false;
  }

  if (normalizedPath.includes('~')) {
    return false;
  }

  if (basePath) {
    return normalizedPath.startsWith(basePath.replaceAll('\\', '/'));
  }

  if (thePath.length >= MAX_FILE_NAME_LENGTH) {
    return false;
  }

  return /^[\w\-. ]+$/.test(thePath);
};
