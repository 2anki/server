import CryptoJS from "crypto-js";

export default function unHashToken(hashed: string): string {
  return CryptoJS.AES.decrypt(hashed, process.env.THE_HASHING_SECRET!).toString(
    CryptoJS.enc.Utf8
  );
}
