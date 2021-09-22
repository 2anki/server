import { Knex } from "knex";

class ResetToken {
  static async IsValid(db: Knex, token: string): Promise<boolean> {
    if (!token || token.length < 128) {
      return false;
    }
    const user = await db("users").where({ reset_token: token });
    /* @ts-ignore */
    return user && user.reset_token;
  }
}

export default ResetToken;
