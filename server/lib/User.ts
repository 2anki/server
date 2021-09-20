import bcrypt from "bcrypt";

class User {
  static HashPassword(password: string): string {
    return bcrypt.hashSync(password, 12);
  }

  static ComparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

export default User;
