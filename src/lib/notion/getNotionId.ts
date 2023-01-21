export const getNotionId = (query: string): string | undefined => {
  if (!query || !query.includes('/')) {
    return undefined;
  }

  const comps = query.split('/');
  const title = comps[comps.length - 1];
  const parts = title.split('-');
  return parts[parts.length - 1];
};
