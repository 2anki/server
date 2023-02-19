export const getKeys = (storage: Storage) =>
  Object.keys(storage).filter((k) => k !== 'token');
