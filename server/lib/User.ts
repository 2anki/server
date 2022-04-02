import bcrypt from "bcryptjs";
import { Knex } from "knex";
import ConversionJob from "./jobs/ConversionJob";

class User {
  owner: string;
  patreon?: boolean;

  constructor(owner: string) {
    this.owner = owner;
  }

  static async GetNotionData(DB: Knex, owner: string) {
    return DB("notion_tokens").where({ owner }).returning(["token"]).first();
  }
  static async UpdatePassword(DB: Knex, password: any, reset_token: any) {
    await DB("users")
      .where({ reset_token })
      .update({ password: User.HashPassword(password), reset_token: null });
  }
  static HashPassword(password: string): string {
    return bcrypt.hashSync(password, 12);
  }

  static ComparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  static GetOwnerFromAccessToken(DB: Knex, token: string) {
    return DB("access_tokens")
      .where({ token, host: "2anki.net" })
      .returning(["owner"])
      .first();
  }

  static GetEmailFromOwner(DB: Knex, id: string) {
    return DB("users").where({ id }).returning(["email"]).first();
  }

  static IsPatreon(DB: Knex, id: string) {
    return DB("users").where({ id }).returning(["patreon"]).first();
  }

  static async getQuota(DB: Knex, owner: string) {
    const allUserUploads = await DB("uploads")
      .where({ owner })
      .returning(["object_id", "status", "size_mb"]);
    let size = 0;
    for (let u of allUserUploads) {
      size += u.size_mb;
    }
    return size;
  }
}

export default User;
