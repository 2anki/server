export const parseTemplate = (json: string | undefined) => {
  if (!json) {
    return undefined;
  }
  return JSON.parse(json);
};
