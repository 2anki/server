export const persist = (key: string, value: string, pageId: string | null) => {
  if (pageId) {
    return;
  }
  localStorage.setItem(key, value);
};
