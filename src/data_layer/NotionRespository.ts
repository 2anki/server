import { Knex } from 'knex';
import NotionTokens from '../schemas/public/NotionTokens';
import unHashToken from '../lib/misc/unHashToken';

class NotionRepository {
  notionTokensTable = 'notion_tokens';

  notionBlocksTable = 'blocks';

  constructor(private readonly database: Knex) {}

  getNotionData(owner: number | string): Promise<NotionTokens> {
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
          notion_owner: data.owner,
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

  async getNotionToken(owner: string) {
    if (!owner) {
      return null;
    }
    const row = await this.database('notion_tokens')
      .where({ owner })
      .returning('token')
      .first();
    return unHashToken(row.token);
  }

  deleteBlocksByOwner(owner: number) {
    return this.database(this.notionBlocksTable).del().where({ owner });
  }
}

export default NotionRepository;
