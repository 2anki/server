import crypto from 'crypto';

import jwt from 'jsonwebtoken';

import DB from '../storage/db';
import hashToken from './hashToken';
import unHashToken from './unHashToken';

interface User {
  owner: string;
  patreon?: boolean;
}

class TokenHandler {
  static SaveNotionToken(
    user: number,
    data: { [key: string]: string }
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      DB('notion_tokens')
        .insert({
          token_type: data.token_type,
          bot_id: data.bot_id,
          workspace_name: data.workspace_name,
          workspace_icon: data.workspace_icon,
          workspace_id: data.workspace_id,
          notion_owner: data.owner,
          token: hashToken(data.access_token),
          owner: user,
        })
        .onConflict('owner')
        .merge()
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static SavePatreonToken(
    user: number,
    token: string,
    data: { [key: string]: string }
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      DB('patreon_tokens')
        .insert({
          data,
          token,
          owner: user,
        })
        .onConflict('owner')
        .merge()
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  static async GetNotionToken(owner: string) {
    if (!owner) {
      return null;
    }
    const row = await DB('notion_tokens')
      .where({ owner })
      .returning('token')
      .first();
    return unHashToken(row.token);
  }

  static GetPatreonToken(owner: number) {
    if (!owner) {
      return null;
    }
    return DB('patreon_token').where({ owner }).returning('token').first();
  }

  static NewResetToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  static async IsValidResetToken(token: string): Promise<boolean> {
    if (!token || token.length < 128) {
      return false;
    }
    const user = await DB('users').where({ reset_token: token }).first();
    return user && user.reset_token;
  }

  static IsValidJWTToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!token) {
        resolve(false);
        return;
      }
      jwt.verify(token, process.env.SECRET!, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async GetUserFrom(token: string): Promise<User | null> {
    const isValid = await TokenHandler.IsValidJWTToken(token);
    if (!isValid) {
      return null;
    }

    const accessToken = await DB('access_tokens')
      .where({ token })
      .returning(["owner'"])
      .first();

    if (!accessToken) {
      return null;
    }

    const user = await DB('users').where({ id: accessToken.owner }).first();
    if (!user || !user.id) {
      return null;
    }
    return { ...user, owner: user.id };
  }

  static NewJWTToken(userId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { userId },
        process.env.SECRET!,
        // TODO: let user decide expiry
        // { expiresIn: "1d" },
        (error: Error | null, token: string | undefined) => {
          if (error) {
            reject(error);
          } else if (token) {
            resolve(token);
          } else {
            reject(new Error('Token is undefined'));
          }
        }
      );
    });
  }
}

export default TokenHandler;
