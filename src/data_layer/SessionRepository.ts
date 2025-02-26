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

  getSession(userId: string | number) {
    console.log('[SESSION] Getting session for user:', userId);
    return this.database('sessions')
      .where({ userId })
      .first()
      .then((session) => {
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
      });
  }

  async updateSession(userId: string | number, data: any) {
    console.log('[SESSION] Updating session for user:', userId);
    const old = await this.getSession(userId);
    return this.database('sessions')
      .where({ userId })
      .update({
        data: JSON.stringify({
          ...old?.data,
          ...data,
        }),
      });
  }

  deleteSession(userId: string | number) {
    console.log('[SESSION] Deleting session for user:', userId);
    return this.database('sessions').where({ userId }).del();
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
