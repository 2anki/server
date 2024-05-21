export const isPaying = (locals?: Record<string, boolean>) => {
  if (!locals) {
    return false;
  }
  return locals.patreon || locals.subscriber;
};
