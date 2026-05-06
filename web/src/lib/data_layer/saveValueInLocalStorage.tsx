// Note that in the pageId null case this is a NO-op.
// This can be refactored away but left in to reduce on regression testing.
export const saveValueInLocalStorage = (key: string, value: string, pageId: string | null) => {
  if (pageId) {
    return;
  }
  localStorage.setItem(key, value);
};
