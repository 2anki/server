import type { Knex } from 'knex';

export interface IInactivityEmailRepository {
  getUsersToNotify(limit?: number): Promise<Array<{ id: number; name: string; email: string }>>;
  recordSend(userId: number, token: string): Promise<void>;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
}

export class InactivityEmailRepository implements IInactivityEmailRepository {
  private readonly table = 'inactivity_emails';

  constructor(private readonly database: Knex) {}

  async getUsersToNotify(limit = 500): Promise<
    Array<{ id: number; name: string; email: string }>
  > {
    const rows = await this.database<UserRow>('users')
      .select('users.id', 'users.name', 'users.email')
      .where(function () {
        this.whereRaw(
          "users.last_login_at < now() - interval '6 months'"
        ).orWhereRaw(
          "users.last_login_at IS NULL AND users.created_at < now() - interval '6 months'"
        );
      })
      .whereRaw('users.patreon IS NOT TRUE')
      .whereNotExists(
        this.database('subscriptions')
          .where('subscriptions.active', true)
          .whereRaw(
            '(subscriptions.email = users.email OR subscriptions.linked_email = users.email)'
          )
          .limit(1)
      )
      .whereNotExists(
        this.database(this.table)
          .whereRaw('inactivity_emails.user_id = users.id')
          .limit(1)
      )
      .whereNotExists(
        this.database('email_preferences')
          .whereRaw('email_preferences.user_id = users.id')
          .where('email_preferences.marketing_opt_out', true)
          .limit(1)
      )
      .limit(limit);

    return rows.map((row) => ({ id: row.id, name: row.name, email: row.email }));
  }

  async recordSend(userId: number, token: string): Promise<void> {
    await this.database(this.table).insert({ user_id: userId, token });
  }
}

export class InMemoryInactivityEmailRepository
  implements IInactivityEmailRepository
{
  private usersToReturn: Array<{ id: number; name: string; email: string }> =
    [];
  private readonly sentUserIds = new Set<number>();

  seedUsers(users: Array<{ id: number; name: string; email: string }>): void {
    this.usersToReturn = users;
  }

  async getUsersToNotify(limit = 500): Promise<
    Array<{ id: number; name: string; email: string }>
  > {
    return this.usersToReturn.filter((u) => !this.sentUserIds.has(u.id)).slice(0, limit);
  }

  async recordSend(userId: number, _token: string): Promise<void> {
    this.sentUserIds.add(userId);
  }

  getSentUserIds(): ReadonlySet<number> {
    return this.sentUserIds;
  }

  clear(): void {
    this.usersToReturn = [];
    this.sentUserIds.clear();
  }
}

export default InactivityEmailRepository;
