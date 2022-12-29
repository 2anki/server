import fs from 'fs';
import path from 'path';

export const NOTION_STYLE = fs.readFileSync(
  path.join(__dirname, './notion.css'),
  'utf8'
);
