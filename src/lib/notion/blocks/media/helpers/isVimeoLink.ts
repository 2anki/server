export const isVimeoLink = (url: string | null) => {
  if (!url) {
    return null;
  }
  return url.match('vimeo.com');
};
