test('Highlighted text is rendered with background', async () => {
  const mockToggleBlock = {
    object: 'block' as const,
    id: 'highlight-test-id',
    parent: { type: 'page_id' as const, page_id: 'page-id' },
    created_time: '',
    last_edited_time: '',
    created_by: { object: 'user' as const, id: 'user-id' },
    last_edited_by: { object: 'user' as const, id: 'user-id' },
    has_children: false,
    archived: false,
    in_trash: false,
    type: 'toggle' as const,
    toggle: {
      rich_text: [
        {
          type: 'text' as const,
          text: { content: 'This is a ', link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default' as const,
          },
          plain_text: 'This is a ',
          href: null,
        },
        {
          type: 'text' as const,
          text: { content: 'highlighted ', link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'yellow_background' as const,
          },
          plain_text: 'highlighted ',
          href: null,
        },
        {
          type: 'text' as const,
          text: { content: 'line', link: null },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default' as const,
          },
          plain_text: 'line',
          href: null,
        },
      ],
      color: 'default' as const,
    },
  };
  const settings = new CardOption({});
  const exporter = new CustomExporter('', new Workspace(true, 'fs').location);
  const bl = new BlockHandler(exporter, api, settings);
  const flashcards = await bl.getFlashcards(
    new ParserRules(),
    [mockToggleBlock],
    [],
    undefined
  );
  expect(flashcards.length).toBeGreaterThan(0);
  const card = flashcards[0];
  expect(card.name).toContain('<span style="background-color:#DFAB01">highlighted </span>');
});
import * as dotenv from 'dotenv';
import CustomExporter from '../../../lib/parser/exporters/CustomExporter';
import Note from '../../../lib/parser/Note';
import ParserRules from '../../../lib/parser/ParserRules';

import CardOption from '../../../lib/parser/Settings/CardOption';
import Workspace from '../../../lib/parser/WorkSpace';
import { setupTests } from '../../../test/configure-jest';
import { pageId as examplId } from '../../../test/test-utils';
import MockNotionAPI from '../_mock/MockNotionAPI';
import { getToggleBlocks } from '../helpers/getToggleBlocks';
import renderTextChildren from '../helpers/renderTextChildren';
import BlockHandler from './BlockHandler';

dotenv.config({ path: 'test/.env' });
const api = new MockNotionAPI(process.env.NOTION_KEY!, '3');

type Options = { [key: string]: string };

const loadCards = async (
  options: Options,
  pageId: string,
  ws: Workspace,
  rules?: ParserRules
): Promise<Note[]> => {
  const settings = new CardOption(options);
  const r = rules || new ParserRules();
  const exporter = new CustomExporter('', ws.location);
  const bl = new BlockHandler(exporter, api, settings);
  const decks = await bl.findFlashcards({
    parentType: 'page',
    topLevelId: pageId,
    rules: r,
    decks: [],
    parentName: '',
  });
  return decks[0].cards;
};

async function findCardByName(
  name: string,
  options: Options
): Promise<Note | undefined> {
  const flashcards = await loadCards(
    options,
    examplId,
    new Workspace(true, 'fs'),
    new ParserRules()
  );
  return flashcards.find((f) => f.name.includes(name));
}

beforeEach(() => setupTests());

jest.mock('get-notion-object-title', () => ({
  getNotionObjectTitle: jest.fn(),
}));

describe('BlockHandler', () => {
  test.skip('Get Notion Page', async () => {
    const page = await api.getPage('446d09aa05d041058c16e56232188e2b');
    const title = await api.getPageTitle(page, new CardOption({}));
    expect(title).toBe('Testing');
  });

  test('Get Blocks', async () => {
    // This should be mocked
    const blocks = await api.getBlocks({
      createdAt: '',
      lastEditedAt: '',
      id: '07a7b319183642b9afecdcc4c456f73d',
      all: true,
      type: 'page',
    });
    const topLevelToggles = getToggleBlocks(blocks.results);
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
    const settings = new CardOption({ all: 'true' });
    const rules = new ParserRules();
    const exporter = new CustomExporter('', new Workspace(true, 'fs').location);
    const bl = new BlockHandler(exporter, api, settings);
    const decks = await bl.findFlashcards({
      parentType: 'page',
      topLevelId: examplId,
      rules,
      decks: [],
      parentName: '',
    });

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
    // For toggle blocks, the front should contain the rendered summary (question) as HTML
    expect(card.name).toBe('1 - This is a basic card');
    // The back should contain the rendered children content (answer)
    expect(card.back).toBe(
      '<p class="" id="f83ce56a-9039-4888-81be-375b19a84790">This is the back of the card</p>'
    );
  });

  test('Multi-line Toggle with Cloze and Newlines', async () => {
    // Test cloze deletion with the exact data from the user's issue
    const flashcards = await loadCards(
      { cloze: 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    
    // Find the cloze card (should be the second card based on mock data)
    const clozeCard = flashcards.find((c) =>
      c.name.includes('{{c1::cloze deletion}}')
    );
    
    expect(clozeCard).toBeTruthy();
    expect(clozeCard?.name).toContain('{{c1::cloze deletion}}');
  });

  test('Multi-line Toggle with Newlines (Basic)', async () => {
    // Test the basic (non-cloze) processing with the multi-line mock data
    const mockToggleBlock = {
      object: "block" as const,
      id: "0d29f785-320d-4fce-ae81-9bf0b02b81cc",
      parent: {
        type: "page_id" as const,
        page_id: "43df8b2d-4e00-4d2c-8848-07a60c2cc1cd"
      },
      created_time: "2021-04-13T18:35:00.000Z",
      last_edited_time: "2021-04-13T18:35:00.000Z",
      created_by: {
        object: "user" as const,
        id: "1590db54-99fe-467c-a656-be319fe6ca8b"
      },
      last_edited_by: {
        object: "user" as const,
        id: "1590db54-99fe-467c-a656-be319fe6ca8b"
      },
      has_children: false,
      archived: false,
      in_trash: false,
      type: "toggle" as const,
      toggle: {
        rich_text: [
          {
            type: "text" as const,
            text: {
              content: "Mult-line cloze \n",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default" as const
            },
            plain_text: "Mult-line cloze \n",
            href: null
          },
          {
            type: "text" as const,
            text: {
              content: "First",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: true,
              color: "default" as const
            },
            plain_text: "First",
            href: null
          },
          {
            type: "text" as const,
            text: {
              content: "\n",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default" as const
            },
            plain_text: "\n",
            href: null
          },
          {
            type: "text" as const,
            text: {
              content: "Second",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: true,
              color: "default" as const
            },
            plain_text: "Second",
            href: null
          },
          {
            type: "text" as const,
            text: {
              content: " \n",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default" as const
            },
            plain_text: " \n",
            href: null
          },
          {
            type: "text" as const,
            text: {
              content: "Third",
              link: null
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: true,
              color: "default" as const
            },
            plain_text: "Third",
            href: null
          }
        ],
        color: "default" as const
      }
    };

    // Test with cloze enabled to match user's scenario
    const settings = new CardOption({ cloze: 'true' });
    const exporter = new CustomExporter('', new Workspace(true, 'fs').location);
    const bl = new BlockHandler(exporter, api, settings);
    
    // Process the block through getFlashcards
    const flashcards = await bl.getFlashcards(
      new ParserRules(),
      [mockToggleBlock],
      [],
      undefined
    );
    
    expect(flashcards.length).toBeGreaterThan(0);
    const card = flashcards[0];
    
    // Should contain both cloze syntax and <br /> tags for newlines
    expect(card.name).toBe('Mult-line cloze <br />{{c1::First}}<br />{{c2::Second}} <br />{{c3::Third}}');
    expect(card.name).toContain('{{c1::First}}');
    expect(card.name).toContain('{{c2::Second}}');
    expect(card.name).toContain('{{c3::Third}}');
    expect(card.name).toContain('<br />');
  });

  test('Cloze Deletion from Blocks', async () => {
    const flashcards = await loadCards(
      { cloze: 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find((c) =>
      c.name.includes('2 - This is a {{c1::cloze deletion}}')
    );
    expect(card?.back).toBe(
      '<p class="" id="34be35bd-db68-4588-85d9-e1adc84c45a5">Extra</p>'
    );
  });

  test('Input Cards from Blocks', async () => {
    const flashcards = await loadCards(
      { cloze: 'false', 'enable-input': 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    expect(
      flashcards.find((n) => n.name.includes('6 - 21 + 21 is '))
    ).toBeTruthy();
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

  test('Use Notion ID', async () => {
    const flashcards = await loadCards(
      { 'use-notion-id': 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find((f) =>
      f.name.includes('3 - 21 + 21 is #buddy')
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
    const flashcards = await loadCards(
      { paragraph: 'true' },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find((c) =>
      c.name.includes('1 - This is a basic card')
    );
    expect(card?.back).toBe('This is the back of the card');
  });

  test('Basic and Reversed', async () => {
    const flashcards = await loadCards(
      { 'basic-reversed': 'true' },
      'fb300010f93745e882e1fd04e0cae6ef',
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    expect(flashcards.length).toBe(2);
  });

  jest.setTimeout(90000);
  test('Enable two columns', async () => {
    const rules = new ParserRules();
    rules.setFlashcardTypes(['column_list']);
    const flashcards = await loadCards(
      {
        'basic-reversed': 'false',
      },
      'eb64d738c17b444ab9d8a747372bed85',
      new Workspace(true, 'fs'),
      rules
    );
    expect(flashcards.length).toBe(1);
  });

  test('Add Notion Link', async () => {
    const expected =
      'https://www.notion.so/Notion-API-Test-Page-3ce6b147ac8a425f836b51cc21825b85#e5201f35c72240d38e3a5d218e5d80a5';
    const flashcards = await loadCards(
      {
        'add-notion-link': 'true',
        parentBlockId: examplId,
      },
      examplId,
      new Workspace(true, 'fs'),
      new ParserRules()
    );
    const card = flashcards.find((f) =>
      f.name.includes('1 - This is a basic card')
    );
    expect(card).toBeTruthy();
    expect(card?.notionLink).toBe(expected);
  });

  test.todo('Maximum One Toggle Per Card');
  test.todo('Use All Toggle Lists');
  test.todo('Template Options');
  test.todo('Just the Reversed Flashcards');
  test.todo('Remove Underlines');
  test.todo('Download Media Files');
  test.todo('Preserve Newlines in the Toggle Header and Body');
});
