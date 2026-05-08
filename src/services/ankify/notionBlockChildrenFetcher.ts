import { Client as NotionClient } from '@notionhq/client';

export const notionBlockChildrenFetcherFactory = (token: string) => {
  const notion = new NotionClient({ auth: token });
  return async (blockId: string) => {
    const aggregated: unknown[] = [];
    let cursor: string | undefined;
    do {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100,
        ...(cursor != null ? { start_cursor: cursor } : {}),
      });
      aggregated.push(...response.results);
      cursor = response.next_cursor ?? undefined;
    } while (cursor != null);
    return aggregated as never;
  };
};
