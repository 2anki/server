import mammoth from 'mammoth';

import { preprocessDocxHTML } from './preprocessDocxHTML';

export async function convertDocxToHTML(contents: Buffer): Promise<string> {
  const result = await mammoth.convertToHtml({ buffer: contents });
  if (result.messages.length > 0) {
    console.log('[convertDocxToHTML] conversion warnings', result.messages);
  }
  return preprocessDocxHTML(result.value);
}
