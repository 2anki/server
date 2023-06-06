import { FileBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { isFullBlock } from '@notionhq/client';

export const getFileUrl = (block: FileBlockObjectResponse): string | null => {
  if (!isFullBlock(block)) {
    return null;
  }
  switch (block.file.type) {
    case 'external':
      return block.file.external.url;
    case 'file':
      return block.file.file.url;
    default:
      return 'unsupported file: ' + JSON.stringify(block);
  }
};
