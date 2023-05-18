import express from 'express';

import DB from '../lib/storage/db';
import AccessTokens from '../schemas/public/AccessTokens';
import { Knex } from 'knex';

class TokenRepository {
  database: Knex;

  table: string;

  constructor() {
    this.table = 'access_tokens';
    this.database = DB;
  }

  getOwnerByToken(req: express.Request): Promise<AccessTokens> {
    return this.database(this.table)
      .where({ token: req.cookies.token })
      .first();
  }
}

export default TokenRepository;
