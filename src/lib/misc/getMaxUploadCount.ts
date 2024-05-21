interface IGetMaxUploadCount {
  patreon?: boolean;
  subscriber?: boolean;
}

export function getMaxUploadCount(options?: IGetMaxUploadCount) {
  const maxUploadCount = 21;
  if (options?.patreon || options?.subscriber) {
    return maxUploadCount * 100;
  }
  return maxUploadCount;
}
