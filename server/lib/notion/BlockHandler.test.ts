import path from 'path';
import os from 'os';

import CustomExporter from '../parser/CustomExporter';
import Note from '../parser/Note';
import ParserRules from '../parser/ParserRules';

import Settings from '../parser/Settings';
import Workspace from '../parser/WorkSpace';
import BlockHandler from './BlockHandler';
import { pageId as examplId } from '../../test/test-utils';
import MockNotionAPI from './_mock/MockNotionAPI';

import * as dotenv from 'dotenv';
dotenv.config({ path: 'test/.env' });
const api = new MockNotionAPI(process.env.NOTION_KEY!);

const loadCards = async (
  options: any,
  pageId: string,
  ws: Workspace,
  rules?: ParserRules
): Promise<Note[]> => {
  const settings = new Settings(options);
  const r = rules || new ParserRules();
  const exporter = new CustomExporter('', ws.location);
  const bl = new BlockHandler(exporter, api);
  const decks = await bl.findFlashcards(pageId, r, settings, []);
  return decks[0].cards;
};

const defaultFront = (s: string) => `<div class="">${s}</div>`;

async function findCardByName(
  name: string,
  options: Object
): Promise<Note | undefined> {
  const flashcards = await loadCards(
    options,
    examplId,
    new Workspace(true, 'fs'),
    new ParserRules()
  );
  return flashcards.find((f) => f.name === defaultFront(name));
}

beforeEach(() => {
  process.env.WORKSPACE_BASE = path.join(os.tmpdir(), 'workspaces');
});

describe('BlockHandler', () => {
  test('Get Notion Page', async () => {
    const page = await api.getPage('3ce6b147ac8a425f836b51cc21825b85');
    const title = await api.getPageTitle(page, new Settings({}));
    expect(title).toBe('Notion API Test Page');
  });

  test('Get Blocks', async () => {
    // This should be mocked
    const blocks = await api.getBlocks(
      '07a7b319183642b9afecdcc4c456f73d',
      true
    );
    /* @ts-ignore */
    const topLevelToggles = blocks.results.filter((t) => t.type === 'toggle');
    expect(topLevelToggles.length).toEqual(14);
  });

  test.skip('Toggle Headings in HTML export', async () => {
    const r = new ParserRules();
    r.setFlashcardTypes(['heading']);
    const cards = await loadCards(
      {},
      '25226df63b4d4895a71f3bba01d8a8f3',
      new Workspace(true, 'fs'),
      r
    );
    console.log('cards', JSON.stringify(cards, null, 4));
    expect(cards.length).toBe(1);
  });

  test.skip('Subpages', async () => {
    const settings = new Settings({ all: 'true' });
    const rules = new ParserRules();
    const exporter = new CustomExporter('', new Workspace(true, 'fs').location);
    const bl = new BlockHandler(exporter, api);
    const decks = await bl.findFlashcards(examplId, rules, settings, []);

    expect(decks.length > 1).toBe(true);
    expect(decks[1].name.includes('::')).toBe(true);
  });

  test.skip('Toggle Mode', async () => {
    const flashcards = await loadCards(
      {},
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const nestedOnes = flashcards.find((c) => c.name.match(/Nested/i));
    expect(nestedOnes?.back).toBe(true);
  });

  test.skip('Strikethrough Local Tags', async () => {
    const card = await findCardByName('This card has three tags', {
      tags: 'true',
    });
    const expected = ['global tag', 'tag a', 'tag b'];
    expect(card?.tags).toBe(expected);
  });

  test('Basic Cards from Blocks', async () => {
    const flashcards = await loadCards(
      { cloze: 'false' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards[0];
    expect(card.name).toBe(defaultFront('1 - This is a basic card'));
    expect(card.back).toBe(
      `<p class="" id="f83ce56a-9039-4888-81be-375b19a84790">This is the back of the card</p>`
    );
  });

  test('Cloze Deletion from Blocks', async () => {
    const flashcards = await loadCards(
      { cloze: true },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards[1];
    expect(card.name).toBe('2 - This is a {{c1::cloze deletion}}');
    expect(card.back).toBe(
      `<p class="" id="34be35bd-db68-4588-85d9-e1adc84c45a5">Extra</p>`
    );
  });

  test('Input Cards from Blocks', async () => {
    const flashcards = await loadCards(
      { cloze: 'false', input: 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    expect(flashcards.find((n) => n.name == '6 - 21 + 21 is ')).toBeTruthy();
  });

  test('Enable Cherry Picking Using 🍒 Emoji', async () => {
    const flashcards = await loadCards(
      { cherry: 'true', cloze: 'true' },
      examplId,
      new Workspace(true, 'fs')
    );
    expect(flashcards.length).toBe(2);
  });

  test("Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji", async () => {
    const flashcards = await loadCards(
      { avocado: 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const avocado = flashcards.find((c) => c.name.includes('🥑'));
    expect(avocado).toBeFalsy();
  });

  test('Add Notion Link', async () => {
    const expected =
      'https://www.notion.so/Notion-API-Test-Page-3ce6b147ac8a425f836b51cc21825b85#e5201f35c72240d38e3a5d218e5d80a5';
    const flashcards = await loadCards(
      {
        'add-notion-link': true,
        parentBlockId: examplId,
      },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find(
      (f) => f.name === defaultFront('1 - This is a basic card')
    );
    expect(card).toBeTruthy();
    expect(card?.notionLink).toBe(expected);
  });

  test('Use Notion ID', async () => {
    const flashcards = await loadCards(
      { 'use-notion-id': 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find(
      (f) => f.name === defaultFront('3 - 21 + 21 is #buddy')
    );
    const expected = 'a5445230-bfa9-4bf1-bc35-a706c1d129d1';
    expect(card?.notionId).toBe(expected);
  });

  test('Strikethrough Global Tags', async () => {
    const card = await findCardByName('This card has global tags', {
      tags: 'true',
    });
    expect(card?.tags.includes('global-tag')).toBe(true);
    expect(card?.tags.includes('global-tag')).toBe(true);
  });

  test('Use Plain Text for Back', async () => {
    const card = await findCardByName('1 - This is a basic card', {
      paragraph: 'true',
    });
    expect(card?.back).toBe('This is the back of the card');
  });

  test.todo('Maximum One Toggle Per Card');
  test.todo('Use All Toggle Lists');
  test.todo('Template Options');
  test.todo('Basic and Reversed');
  test.todo('Just the Reversed Flashcards');
  test.todo('Remove Underlines');
  test.todo('Download Media Files');
  test.todo('Preserve Newlines in the Toggle Header and Body');
});
