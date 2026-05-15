import { Knex } from 'knex';

import Users from './public/Users';
import Subscriptions from './public/Subscriptions';
import { isNewMonth } from '../lib/User/isNewMonth';

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

  async getAiTemplateCounts(id: string | number) {
    const row = await this.database
      .table(this.table)
      .where({ id })
      .select('ai_template_generate_count', 'ai_template_modify_count')
      .first();
    return {
      generate: row?.ai_template_generate_count ?? 0,
      modify: row?.ai_template_modify_count ?? 0,
    };
  }

  incrementAiTemplateGenerateCount(id: string | number) {
    return this.database(this.table)
      .where({ id })
      .increment('ai_template_generate_count', 1);
  }

  incrementAiTemplateModifyCount(id: string | number) {
    return this.database(this.table)
      .where({ id })
      .increment('ai_template_modify_count', 1);
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
      .whereRaw('LOWER(TRIM(email)) = LOWER(?)', [email.trim()])
      .first();
  }

  updateResetToken(id: string, resetToken: string) {
    return this.database(this.table)
      .where({ id })
      .update({ reset_token: resetToken });
  }

  createUser(
    name: string,
    password: string,
    email: string,
    signupOrigin?: string | null
  ) {
    return this.database(this.table)
      .insert({
        name,
        password,
        email,
        signup_origin: signupOrigin ?? null,
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


  updateLastLoginAt(id: string) {
    return this.database(this.table).where({ id }).update({
      last_login_at: this.database.fn.now()
    });
  }

  markHostedAnkiRequested(id: string) {
    return this.database(this.table).where({ id }).update({
      hosted_anki_requested_at: this.database.fn.now(),
    });
  }

  markAnkifyWelcomeSeen(id: string) {
    return this.database(this.table).where({ id }).update({
      ankify_welcome_seen: true,
    });
  }

  markTrialStarted(userId: string) {
    return this.database(this.table).where({ id: userId }).update({
      trial_started_at: this.database.fn.now(),
    });
  }

  markEmailVerified(userId: string) {
    return this.database(this.table)
      .where({ id: userId })
      .update({ email_verified: true });
  }

  updatePatreonByEmail(email: string, patreon: boolean): Promise<number> {
    return this.database(this.table)
      .whereRaw('TRIM(LOWER(email)) = ?', [email.toLowerCase().trim()])
      .update({ patreon });
  }

  async checkSubscriptionEmailExists(email: string): Promise<boolean> {
    const subscription = await this.database('subscriptions')
      .where({ email: email.toLowerCase() })
      .first();
    return !!subscription;
  }

  async getCardUsage(
    id: string | number
  ): Promise<{ cards_used: number; month_started_at: Date | null }> {
    const row = await this.database
      .table(this.table)
      .where({ id })
      .select('cards_used_this_month', 'cards_month_started_at')
      .first();
    if (!row) {
      return { cards_used: 0, month_started_at: null };
    }
    const startedAt: Date | null = row.cards_month_started_at ?? null;
    if (startedAt && isNewMonth(startedAt, new Date())) {
      return { cards_used: 0, month_started_at: startedAt };
    }
    return {
      cards_used: row.cards_used_this_month ?? 0,
      month_started_at: startedAt,
    };
  }

  incrementCardUsage(id: string | number, cardCount: number) {
    if (cardCount <= 0) return Promise.resolve(0);
    return this.database(this.table)
      .where({ id })
      .update({
        cards_used_this_month: this.database.raw(
          `CASE WHEN cards_month_started_at < date_trunc('month', NOW()) THEN ? ELSE cards_used_this_month + ? END`,
          [cardCount, cardCount]
        ),
        cards_month_started_at: this.database.raw(
          `CASE WHEN cards_month_started_at < date_trunc('month', NOW()) THEN date_trunc('month', NOW()) ELSE cards_month_started_at END`
        ),
      });
  }
}

export default UsersRepository;
