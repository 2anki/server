import { Knex } from 'knex';

import Users from './public/Users';

class UsersRepository {
  table: string;

  constructor(private database: Knex) {
    this.database = database;
    this.table = 'users';
  }

  async getById(id: string): Promise<Users> {
    const user = await this.database.table(this.table).where({ id }).first();
    return user;
  }

  updatePassword(hashPassword: string, reset_token: string) {
    return this.database(this.table)
      .where({ reset_token })
      .update({ password: hashPassword, reset_token: null });
  }

  getByResetToken(token: string) {
    return this.database(this.table).where({ reset_token: token }).first();
  }

  getByEmail(email: string) {
    return this.database(this.table)
      .where({ email: email.toLocaleLowerCase() })
      .returning(['reset_token', 'id'])
      .first();
  }

  updateResetToken(id: string, resetToken: string) {
    return this.database(this.table)
      .where({ id })
      .update({ reset_token: resetToken });
  }

  createUser(name: string, password: string, email: any) {
    return this.database(this.table)
      .insert({
        name,
        password,
        email,
      })
      .returning(['id']);
  }

  deleteUser(owner: string) {
    const ownerTables = [
      'access_tokens',
      'favorites',
      'jobs',
      'notion_tokens',
      'settings',
      'templates',
      'uploads',
      'blocks',
    ];
    return Promise.all([
      ...ownerTables.map((tableName) =>
        this.database(tableName).where({ owner }).del()
      ),
      this.database(this.table).where({ id: owner }).del(),
    ]);
  }
}

export default UsersRepository;
