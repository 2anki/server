import path from "path";

export const TEMPLATE_DIR = path.join(__dirname, "./templates");

export const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:2020",
  "https://dev.notion2anki.alemayhu.com",
  "https://dev.2anki.net",
  "https://notion.2anki.com",
  "https://2anki.net",
  "https://2anki.com",
  "https://notion.2anki.net",
  "https://dev.notion.2anki.net",
  "https://notion.2anki.net/",
];

export function resolvePath(dir: string, x: string) {
  const p = path
    .resolve(path.join(dir, x))
    .replace(/app.asar/g, "app.asar.unpacked");
  return x.endsWith("/") ? p + "/" : p;
}

export const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
export const REDIRECT_URI = "https://2anki.net/connect-notion";
