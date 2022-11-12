import bcrypt from 'bcryptjs';

export default function comparePassword(
  password: string,
  hash: string
): boolean {
  return bcrypt.compareSync(password, hash);
}
