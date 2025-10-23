import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const payloadBase = path.resolve(__dirname, '../payloads');

const endpoints = {
  GetPageResponse: async (id: string) => notion.pages.retrieve({ page_id: id }),
  ListBlockChildrenResponse: async (id: string) => notion.blocks.children.list({ block_id: id }),
  GetBlockResponse: async (id: string) => notion.blocks.retrieve({ block_id: id }),
  QueryDatabaseResponse: async (id: string) => notion.databases.query({ database_id: id }),
};

function getPayloadPath(type: string, id: string) {
  return path.join(payloadBase, type, `${id}.json`);
}

async function updateMock(type: keyof typeof endpoints, id: string) {
  const data = await endpoints[type](id);
  const outPath = getPayloadPath(type, id);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`Updated mock: ${outPath}`);
}

async function main() {
  // Example usage: update mocks for a list of IDs
  const updates: Array<{ type: keyof typeof endpoints; id: string }> = [
    // Fill in with your IDs and types
    // { type: 'GetPageResponse', id: 'your-page-id' },
    // { type: 'ListBlockChildrenResponse', id: 'your-block-id' },
  ];
  for (const { type, id } of updates) {
    await updateMock(type, id);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
