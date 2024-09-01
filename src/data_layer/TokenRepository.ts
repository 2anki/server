import AccessTokens from './public/AccessTokens';
import { Knex } from 'knex';

class TokenRepository {
  table: string;

  constructor(private readonly database: Knex) {
    this.table = 'access_tokens';
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
