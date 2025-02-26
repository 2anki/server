import { Knex } from 'knex';

interface DatabaseSession {
  id: string;
  userId: string;
  data: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: string;
  userId: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export default class SessionRepository {
  private database: Knex;

  constructor(database: Knex) {
    this.database = database;
  }

  createSession(userId: string | number, data: any) {
    console.log('[SESSION] Creating session for user:', userId);
    return this.database('sessions').insert({
      userId,
      data: JSON.stringify(data),
    });
  }

  async getSession(userId: string | number) {
    console.log('[SESSION] Getting session for user:', userId);
    const session = await this.database('sessions')
      .where({ userId })
      .orderBy('created_at', 'desc')
      .first();

    if (!session) return null;
    try {
      const parsedData =
        typeof session.data === 'string'
          ? JSON.parse(session.data)
          : session.data;
      return {
        ...session,
        data: parsedData,
      };
    } catch (error) {
      console.warn('[SESSION] Failed to parse session data:', error);
      return {
        ...session,
        data: session.data,
      };
    }
  }

  async updateSession(userId: string | number, data: any, sessionId: string) {
    console.log(
      '[SESSION] Updating session for user:',
      userId,
      'session:',
      sessionId
    );
    const query = this.database('sessions').where({ userId });

    if (sessionId) {
      query.where({ id: sessionId });
    } else {
      query.orderBy('created_at', 'desc');
    }

    const old = await query.first();
    if (!old) return null;

    return this.database('sessions')
      .where({ id: old.id })
      .update({
        data: JSON.stringify({
          ...old.data,
          ...data,
        }),
      });
  }

  deleteAllSessions(userId: string | number) {
    console.log('[SESSION] Deleting all sessions for user:', userId);
    return this.database('sessions').where({ userId }).del();
  }

  deleteSessionById(sessionId: string, userId: string | number) {
    console.log('[SESSION] Deleting session:', sessionId, 'for user:', userId);
    return this.database('sessions').where({ id: sessionId, userId }).del();
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const sessions = await this.database('sessions')
      .where({ userId })
      .orderBy('created_at', 'desc');

    return sessions.map((session: DatabaseSession) => {
      try {
        const parsedData =
          typeof session.data === 'string'
            ? JSON.parse(session.data)
            : session.data;
        return {
          id: session.id,
          userId: session.userId,
          data: parsedData,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
        };
      } catch (error) {
        console.warn('[SESSION] Failed to parse session data:', error);
        return {
          id: session.id,
          userId: session.userId,
          data: session.data,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
        };
      }
    });
  }

  async getSessionById(
    sessionId: string,
    userId: string
  ): Promise<Session | null> {
    const session = await this.database('sessions')
      .where({ id: sessionId, userId })
      .first();

    if (!session) return null;

    try {
      const parsedData =
        typeof session.data === 'string'
          ? JSON.parse(session.data)
          : session.data;
      return {
        id: session.id,
        userId: session.userId,
        data: parsedData,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
      };
    } catch (error) {
      console.warn('[SESSION] Failed to parse session data:', error);
      return {
        id: session.id,
        userId: session.userId,
        data: session.data,
        createdAt: new Date(session.created_at),
        updatedAt: new Date(session.updated_at),
      };
    }
  }
}
