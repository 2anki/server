import qs from 'querystring';
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import TokenRepository from '../data_layer/TokenRepository';
import UsersRepository from '../data_layer/UsersRepository';
import Users from '../data_layer/public/Users';
import { Knex } from 'knex';
import axios from 'axios';

export interface UserWithOwner extends Users {
  owner: number;
}

class AuthenticationService {
  constructor(
    private tokenRepository: TokenRepository,
    private usersRepository: UsersRepository
  ) {}

  isValidToken(token: string): Promise<boolean> {
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

  newResetToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  async isValidResetToken(token: string): Promise<boolean> {
    if (!token || token.length < 128) {
      return false;
    }
    const user = await this.usersRepository.getByResetToken(token);
    return user?.reset_token;
  }

  newJWTToken(userId: number): Promise<string> {
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

  async getUserFrom(token: string): Promise<UserWithOwner | null> {
    const isValid = await this.isValidToken(token);
    if (!isValid) {
      return null;
    }

    const accessToken =
      await this.tokenRepository.getAccessTokenFromString(token);
    if (!accessToken) {
      return null;
    }

    const user = await this.usersRepository.getById(
      accessToken.owner.toString()
    );
    if (!user?.id) {
      return null;
    }
    return { ...user, owner: user.id };
  }

  isNewPasswordValid(resetToken: any, password: any) {
    return (
      !resetToken || resetToken.length < 128 || !password || password.length < 8
    );
  }

  logOut(token: string) {
    return this.tokenRepository.deleteAccessToken(token);
  }

  isValidLogin(email: string, password: string) {
    return email && password && password.length >= 8;
  }

  getHashPassword(password: string) {
    return bcrypt.hashSync(password, 12);
  }

  comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  persistToken(token: string, id: string) {
    return this.tokenRepository.updateAccessToken(token, id);
  }

  async getIsSubscriber(db: Knex, email: string) {
    const linkedEmail = await db('subscriptions')
      .select('active')
      .where({ linked_email: email.toLowerCase() })
      .first();

    if (linkedEmail?.active) {
      return true;
    }

    const result = await db('subscriptions')
      .select('active')
      .where({ email: email.toLowerCase() })
      .first();

    return result?.active ?? false;
  }

  async getSubscriptionInfo(db: Knex, email: string) {
    const linkedEmail = await db('subscriptions')
      .select(['active', 'email', 'linked_email'])
      .where({ linked_email: email.toLowerCase() })
      .first();

    if (linkedEmail?.active) {
      return {
        active: true,
        email: linkedEmail.email,
        linked_email: linkedEmail.linked_email,
      };
    }

    const result = await db('subscriptions')
      .select(['active', 'email', 'linked_email'])
      .where({ email: email.toLowerCase() })
      .first();

    return {
      active: result?.active ?? false,
      email: result?.email,
      linked_email: result?.linked_email,
    };
  }

  async loginWithGoogle(code: string) {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };
    try {
      const result = await axios.post(url, qs.stringify(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const idToken = result.data.id_token;
      const decoded = jwt.decode(idToken)!;
      console.log('decoded', decoded);

      return {
        // @ts-ignore
        email: decoded.email,
        // @ts-ignore
        name: decoded.name,
        // @ts-ignore
        picture: decoded.picture,
      };
    } catch (error) {
      console.info("Couldn't login with Google");
      console.error(error);
    }
  }
}

export default AuthenticationService;
