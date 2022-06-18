import { GetBlockResponse } from '@notionhq/client/build/src/api-endpoints';
import { captureException } from '@sentry/node';
import getPlainText from './getPlainText';

const getSubDeckName = (block: GetBlockResponse | Object) => {
  let subDeckName = 'Untitled';
  /* @ts-ignore */
  const text = block.text;
  /* @ts-ignore */
  const title = block.title;
  try {
    if (text) {
      subDeckName = getPlainText(text);
    } else if (title) {
      subDeckName = title;
    } else {
      /* @ts-ignore */
      subDeckName = block?.properties.title.title[0].plain_text;
    }
  } catch (error) {
    captureException(error);
  }
  return subDeckName;
};

export default getSubDeckName;
