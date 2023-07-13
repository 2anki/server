import { Client, isFullBlock, isFullDatabase } from '@notionhq/client';
import {
  BlockObjectRequest,
  GetBlockResponse,
  GetDatabaseResponse,
  GetPageResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
  SearchResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { getNotionObjectTitle } from 'get-notion-object-title';

import sanitizeTags from '../../lib/anki/sanitizeTags';
import ParserRules from '../../lib/parser/ParserRules';
import Settings from '../../lib/parser/Settings';
import { getParagraphBlocks } from './helpers/getParagraphBlocks';
import renderIcon from './helpers/renderIcon';
import getBlockIcon, { WithIcon } from './blocks/getBlockIcon';
import { isHeading } from './helpers/isHeading';
import { getHeadingText } from './helpers/getHeadingText';
import { getBlockCache } from './helpers/getBlockCache';
import { getDatabase } from '../../data_layer';
import { ValidNotionType } from './types';

const DEFAULT_PAGE_SIZE_LIMIT = 100 * 2;

export interface GetBlockParams {
  createdAt: string;
  lastEditedAt: string;
  id: string;
  type: ValidNotionType;
  all?: boolean;
}

class NotionAPIWrapper {
  private notion: Client;

  page?: GetPageResponse;

  private owner: string;

  constructor(key: string, owner: string) {
    this.notion = new Client({ auth: key });
    this.owner = owner;
  }

  getPage(id: string): Promise<GetPageResponse | null> {
    return this.notion.pages.retrieve({ page_id: id });
  }

  async getBlocks({
    createdAt,
    lastEditedAt,
    id,
    all,
    type,
  }: GetBlockParams): Promise<ListBlockChildrenResponse> {
    console.time(`getBlocks:${id}${all}`);

    // Skip unsupported types to prevent validation errors
    if (type === 'unsupported') {
      return {
        type: 'block',
        block: {},
        object: 'list',
        next_cursor: null,
        has_more: false,
        results: [],
      };
    }

    const cachedPayload = all
      ? await getBlockCache({
          database: getDatabase(),
          id,
          owner: this.owner,
          lastEditedAt,
        })
      : null;
    if (cachedPayload) {
      console.log('using payload cache');
      console.timeEnd(`getBlocks:${id}${all}`);
      return cachedPayload;
    }
    const response = await this.notion.blocks.children.list({
      block_id: id,
      page_size: DEFAULT_PAGE_SIZE_LIMIT,
    });
    console.log('received', response.results.length, 'blocks');

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        const { results, next_cursor: nextCursor }: ListBlockChildrenResponse =
          await this.notion.blocks.children.list({
            block_id: id,
            start_cursor: response.next_cursor!,
          });
        console.log('found more', results.length, 'blocks');
        response.results.push(...results);
        if (nextCursor) {
          response.next_cursor = nextCursor;
        } else {
          console.log('done getting blocks');
          break;
        }
      }
    }
    if (!createdAt || !lastEditedAt) {
      console.log('not enough input block cache');
    } else {
      const database = getDatabase();
      await database('blocks')
        .insert({
          owner: this.owner,
          object_id: id,
          payload: JSON.stringify(response),
          fetch: 1,
          created_at: createdAt,
          last_edited_time: lastEditedAt,
        })
        .onConflict('object_id')
        .merge();
    }
    console.timeEnd(`getBlocks:${id}${all}`);
    return response;
  }

  getBlock(id: string): Promise<GetBlockResponse> {
    return this.notion.blocks.retrieve({
      block_id: id,
    });
  }

  deleteBlock(id: string): Promise<GetBlockResponse> {
    return this.notion.blocks.delete({
      block_id: id,
    });
  }

  createBlock(
    parent: string,
    newBlock: BlockObjectRequest
  ): Promise<ListBlockChildrenResponse> {
    return this.notion.blocks.children.append({
      block_id: parent,
      children: [newBlock],
    });
  }

  getDatabase(id: string): Promise<GetDatabaseResponse> {
    return this.notion.databases.retrieve({ database_id: id });
  }

  async queryDatabase(
    id: string,
    all?: boolean
  ): Promise<QueryDatabaseResponse> {
    console.time(`queryDatabase:${id}${all}`);
    const response = await this.notion.databases.query({
      database_id: id,
      page_size: DEFAULT_PAGE_SIZE_LIMIT,
    });

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        const res2: QueryDatabaseResponse = await this.notion.databases.query({
          database_id: id,
          page_size: DEFAULT_PAGE_SIZE_LIMIT,
          start_cursor: response.next_cursor!,
        });
        response.results.push(...res2.results);
        if (res2.next_cursor) {
          response.next_cursor = res2.next_cursor;
        } else {
          break;
        }
      }
    }
    console.timeEnd(`queryDatabase:${id}${all}`);
    return response;
  }

  async search(query: string, all?: boolean) {
    console.time(`search:${all}`);
    const response = await this.notion.search({
      page_size: DEFAULT_PAGE_SIZE_LIMIT,
      query,
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    if (all && response.has_more && response.next_cursor) {
      while (true) {
        const res2: SearchResponse = await this.notion.search({
          page_size: DEFAULT_PAGE_SIZE_LIMIT,
          query,
          start_cursor: response.next_cursor!,
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        });
        response.results.push(...res2.results);
        if (res2.next_cursor) {
          response.next_cursor = res2.next_cursor;
        } else {
          break;
        }
      }
    }

    console.timeEnd(`search:${all}`);
    return response;
  }

  static GetClientID(): string {
    return process.env.NOTION_CLIENT_ID!;
  }

  async getTopLevelTags(pageId: string, rules: ParserRules) {
    console.time('[NO_CACHE] - getTopLevelTags');
    const useHeadings = rules.TAGS === 'heading';
    const response = await this.getBlocks({
      createdAt: '',
      lastEditedAt: '',
      id: pageId,
      all: rules.UNLIMITED,
      type: 'page',
    });
    const globalTags = [];
    if (useHeadings) {
      const headings = response.results.filter((block) => isHeading(block));
      for (const heading of headings) {
        if (isFullBlock(heading)) {
          const newTag = getHeadingText(heading)
            ?.map((t) => t.plain_text)
            .join('');
          if (newTag) {
            globalTags.push(newTag);
          }
        }
      }
    } else {
      const paragraphs = getParagraphBlocks(response.results);
      for (const p of paragraphs) {
        const pp = p.paragraph;

        if (!pp) {
          continue;
        }

        const tt = pp.rich_text;
        if (!tt || tt.length < 1) {
          continue;
        }

        const { annotations } = tt[0];
        if (annotations.strikethrough) {
          globalTags.push(tt[0].plain_text);
        }
      }
    }
    console.timeEnd('[NO_CACHE] - getTopLevelTags');
    return sanitizeTags(globalTags);
  }

  getBlockTitle(icon: string | null, title: string, settings: Settings) {
    if (!icon) {
      return title;
    }

    // the order here matters due to icon not being set and last not being default
    return settings.pageEmoji !== 'last_emoji'
      ? `${icon}${title}`
      : `${title}${icon}`;
  }

  async getPageTitle(
    page: GetPageResponse | null,
    settings: Settings
  ): Promise<string> {
    if (!page) {
      return '';
    }
    let title = getNotionObjectTitle(page) ?? `Untitled: ${new Date()}`;
    let icon = await renderIcon(
      getBlockIcon(page as WithIcon, settings.pageEmoji)
    );
    return this.getBlockTitle(icon, title, settings);
  }

  async getDatabaseTitle(
    database: GetDatabaseResponse,
    settings: Settings
  ): Promise<string> {
    let icon = await renderIcon(
      getBlockIcon(database as WithIcon, settings.pageEmoji)
    );
    let title = isFullDatabase(database)
      ? database.title.map((t) => t.plain_text).join('')
      : '';
    return this.getBlockTitle(icon, title, settings);
  }
}

export default NotionAPIWrapper;
