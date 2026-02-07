import { Knex } from 'knex';

import Users from './public/Users';
import Subscriptions from './public/Subscriptions';

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
      .whereRaw('TRIM(email) = ?', [email.toLocaleLowerCase().trim()])
      .returning(['reset_token', 'id'])
      .first();
  }

  updateResetToken(id: string, resetToken: string) {
    return this.database(this.table)
      .where({ id })
      .update({ reset_token: resetToken });
  }

  createUser(name: string, password: string, email: string, picture?: string) {
    return this.database(this.table)
      .insert({
        name,
        password,
        email,
        picture,
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
      'dropbox_uploads',
      'google_drive_uploads',
    ];
    return Promise.all([
      ...ownerTables.map((tableName) =>
        this.database(tableName).where({ owner }).del()
      ),
      this.database(this.table).where({ id: owner }).del(),
    ]);
  }

  async linkCurrentUserWithEmail(owner: string, email: string) {
    const user = await this.database(this.table).where({ id: owner }).first();
    if (!user) {
      return null;
    }

    return this.updateSubScriptionEmailUsingPrimaryEmail(user.email, email);
  }

  updateSubScriptionEmailUsingPrimaryEmail(email: string, newEmail: string) {
    return this.database('subscriptions')
      .where({ email: email.toLowerCase() })
      .update({ linked_email: newEmail.toLowerCase() });
  }

  async getSubscriptionLinkedEmail(owner: string) {
    const user = await this.database(this.table).where({ id: owner }).first();
    if (!user) {
      return null;
    }

    const subscription: Subscriptions = await this.database('subscriptions')
      .where({ email: user.email.toLowerCase() })
      .select('linked_email')
      .first();
    return subscription?.linked_email;
  }

  updatePicture(id: string, picture: string) {
    return this.database(this.table).where({ id }).update({ picture });
  }

  updateLastLoginAt(id: string) {
    return this.database(this.table).where({ id }).update({ 
      last_login_at: this.database.fn.now() 
    });
  }

  updatePatreonByEmail(email: string, patreon: boolean) {
    return this.database(this.table).where({ email }).update({ patreon });
  }

  async checkSubscriptionEmailExists(email: string): Promise<boolean> {
    const subscription = await this.database('subscriptions')
      .where({ email: email.toLowerCase() })
      .first();
    return !!subscription;
  }
}

export default UsersRepository;
