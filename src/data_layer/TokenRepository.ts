import express from 'express';

import AccessTokens from '../schemas/public/AccessTokens';
import { Knex } from 'knex';

class TokenRepository {
  table: string;

  constructor(private readonly database: Knex) {
    this.table = 'access_tokens';
  }

  getAccessToken(req: express.Request): Promise<AccessTokens> {
    return this.database(this.table)
      .where({ token: req.cookies.token })
      .first();
  }

  getAccessTokenFromString(token: string): Promise<AccessTokens> {
    return this.database(this.table).where({ token: token }).first();
  }

  deleteAccessToken(token: any) {
    return this.database(this.table).where({ token }).del();
  }

  updateAccessToken(token: string, id: string) {
    return this.database(this.table)
      .insert({
        token,
        owner: id,
      })
      .onConflict('owner')
      .merge();
  }
}

export default TokenRepository;
