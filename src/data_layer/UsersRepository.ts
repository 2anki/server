import bcrypt from 'bcryptjs';
import { Knex } from 'knex';

import Users from '../schemas/public/Users';

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

  updatePassword(password: string, reset_token: string) {
    const hashPassword = this.getHashPassword(password);
    return this.database(this.table)
      .where({ reset_token })
      .update({ password: hashPassword, reset_token: null });
  }

  getHashPassword(password: string) {
    return bcrypt.hashSync(password, 12);
  }

  comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  getByResetToken(token: string) {
    return this.database(this.table).where({ reset_token: token }).first();
  }
}

export default UsersRepository;
