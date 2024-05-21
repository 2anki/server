export function getMaxUploadCount(paying?: boolean) {
  const maxUploadCount = 21;
  if (paying) {
    return maxUploadCount * 100;
  }
  return maxUploadCount;
}
