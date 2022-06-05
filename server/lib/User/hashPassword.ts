import bcrypt from 'bcryptjs';

export default function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}
