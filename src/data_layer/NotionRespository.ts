import { Knex } from 'knex';
import NotionTokens from '../schemas/public/NotionTokens';

class NotionRepository {
  constructor(private readonly database: Knex) {}

  getNotionData(owner: number | string): Promise<NotionTokens> {
    return this.database('notion_tokens')
      .where({ owner: owner })
      .returning(['token', 'workspace_name'])
      .first();
  }
}

export default NotionRepository;
