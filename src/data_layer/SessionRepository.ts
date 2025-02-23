import { Knex } from 'knex';

class SessionRepository {
  constructor(private readonly database: Knex) {}

  createSession(userId: string | number, data: any) {
    console.log('[SESSION] Creating session for user:', userId);
    return this.database('sessions').insert({ userId, data });
  }

  getSession(userId: string | number) {
    console.log('[SESSION] Getting session for user:', userId);
    return this.database('sessions').where({ userId }).first();
  }

  async updateSession(userId: string | number, data: any) {
    console.log('[SESSION] Updating session for user:', userId);
    const old = await this.getSession(userId);
    return this.database('sessions')
      .where({ userId })
      .update({
        data: {
          ...old?.data,
          ...data,
        },
      });
  }

  deleteSession(userId: string | number) {
    console.log('[SESSION] Deleting session for user:', userId);
    return this.database('sessions').where({ userId }).del();
  }
}

export default SessionRepository;
