import jwt from "jsonwebtoken";
import { Knex } from "knex";

class TokenHandler {
  static async IsValidResetToken(db: Knex, token: string): Promise<boolean> {
    if (!token || token.length < 128) {
      return false;
    }
    const user = await db("users").where({ reset_token: token });
    /* @ts-ignore */
    return user && user.reset_token;
  }

  static async IsValidVerificationToken(
    db: Knex,
    token: string
  ): Promise<boolean> {
    if (!token || token.length < 128) {
      return false;
    }
    const user = await db("users").where({ verification_token: token });
    /* @ts-ignore */
    return user && user.verification_token;
  }

  static async IsValidJWTToken(token: string): Promise<boolean> {
    if (!token) {
      return false;
    }
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET!, (error, _decodedToken) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async NewJWTToken(userId: number): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        { userId },
        process.env.SECRET!,
        // { expiresIn: "1d" },
        /* @ts-ignore */
        (error, token) => {
          if (error) {
            reject(error);
          } else {
            resolve(token);
          }
        }
      );
    });
  }
}

export default TokenHandler;
