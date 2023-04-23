import { isVimeoURL } from '../../../../storage/checks';

export const isVimeoLink = (url: string | null) => {
  if (!url) {
    return null;
  }
  return isVimeoURL(url);
};
