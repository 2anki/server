export function isEmptyUpload(files: unknown) {
  return !files || !Array.isArray(files) || files.length === 0;
}
