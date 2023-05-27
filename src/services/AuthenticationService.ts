import TokenRepository from '../data_layer/TokenRepository';
import crypto from 'crypto';

import jwt from 'jsonwebtoken';
import UsersRepository from '../data_layer/UsersRepository';
import Users from '../schemas/public/Users';

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
    return user && user.reset_token;
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

    const accessToken = await this.tokenRepository.getAccessTokenFromString(
      token
    );
    if (!accessToken) {
      return null;
    }

    const user = await this.usersRepository.getById(
      accessToken.owner.toString()
    );
    if (!user || !user.id) {
      return null;
    }
    return { ...user, owner: user.id };
  }

  isNewPasswordValid(resetToken: any, password: any) {
    return (
      !resetToken || resetToken.length < 128 || !password || password.length < 8
    );
  }
}

export default AuthenticationService;
