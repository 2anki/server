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
}

export default TokenHandler;
