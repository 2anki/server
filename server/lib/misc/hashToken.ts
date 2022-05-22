import CryptoJS from 'crypto-js';

export default function hashToken(token: string): string {
  return CryptoJS.AES.encrypt(
    token,
    process.env.THE_HASHING_SECRET!
  ).toString();
}
