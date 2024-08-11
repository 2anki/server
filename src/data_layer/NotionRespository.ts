import { Knex } from 'knex';
import NotionTokens from './public/NotionTokens';
import unHashToken from '../lib/misc/unHashToken';

export interface INotionRepository {
  getNotionData(owner: number | string): Promise<NotionTokens | null>;
  saveNotionToken(
    user: number,
    data: { [key: string]: string },
    hash: (token: string) => string
  ): Promise<boolean>;
  getNotionToken(owner: string): Promise<string | null>;
  deleteBlocksByOwner(owner: number): Promise<number>;
  deleteNotionData(owner: number): Promise<boolean>;
}

class NotionRepository implements INotionRepository {
  notionTokensTable = 'notion_tokens';

  notionBlocksTable = 'blocks';

  constructor(private readonly database: Knex) {}

  getNotionData(owner: number | string): Promise<NotionTokens | null> {
    if (!owner) {
      return Promise.resolve(null);
    }

    return this.database(this.notionTokensTable)
      .where({ owner: owner })
      .returning(['token', 'workspace_name'])
      .first();
  }

  saveNotionToken(
    user: number,
    data: { [key: string]: string },
    hash: (token: string) => string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.database(this.notionTokensTable)
        .insert({
          token_type: data.token_type,
          bot_id: data.bot_id,
          workspace_name: data.workspace_name,
          workspace_icon: data.workspace_icon,
          workspace_id: data.workspace_id,
          notion_owner: data.owner, // This actually JSON blob from Notion and not related to our owner id
          token: hash(data.access_token),
          owner: user,
        })
        .onConflict('owner')
        .merge()
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * Retrieve the users notion token.
   * If the user does not have a token, throws error.
   * The caller is expected to handle this error.
   *
   * @param owner user id
   * @returns unhashed token
   */
  async getNotionToken(owner: string): Promise<string | null> {
    const row = await this.database('notion_tokens')
      .where({ owner })
      .returning('token')
      .first();

    /**
     * The user can disconnect Notion at any point so we should not throw an error here.
     */
    if (!row) {
      return Promise.resolve(null);
    }

    return unHashToken(row.token);
  }

  deleteBlocksByOwner(owner: number): Promise<number> {
    return this.database(this.notionBlocksTable).del().where({ owner });
  }

  /**
   * Delete the users notion token when they disconnect
   */
  deleteNotionData(owner: number | string): Promise<boolean> {
    return this.database(this.notionTokensTable).where({ owner: owner }).del();
  }
}

export default NotionRepository;
