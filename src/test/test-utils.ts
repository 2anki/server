// This file is temporarily to reduce duplication between jest and ava.
// When jest migration is complete it can be deleted most likely

import path from 'path';
import fs from 'fs';

import { DeckParser } from '../lib/parser/DeckParser';
import Settings from '../lib/parser/Settings';

function mockPayload(name: string, contents: string) {
  return [{ name, contents }];
}

function loadFixture(fileName: string) {
  const filePath = path.join(__dirname, 'fixtures', fileName);
  const html = fs.readFileSync(filePath).toString();
  return mockPayload(fileName, html);
}

function configureParser(fileName: string, opts: Settings) {
  const info = loadFixture(fileName);
  return new DeckParser(fileName, opts, info);
}

export async function getDeck(fileName: string, opts: Settings) {
  const p = configureParser(fileName, opts);
  await p.build();
  return p.payload[0];
}
export const pageId = '3ce6b147ac8a425f836b51cc21825b85';
