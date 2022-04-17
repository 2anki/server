import path from 'path';
import fs from 'fs';

import NotionAPIWrapper from './NotionAPIWrapper';
import Note from '../parser/Note';
import Settings from '../parser/Settings';
import ParserRules from '../parser/ParserRules';
import Deck from '../parser/Deck';
import CustomExporter from '../parser/CustomExporter';
import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import { NewUniqueFileNameFrom, S3FileName, SuffixFrom } from '../misc/file';
import axios from 'axios';
import BlockParagraph from './blocks/BlockParagraph';
import BlockCode from './blocks/BlockCode';
import { BlockHeading } from './blocks/BlockHeadings';
import { BlockQuote } from './blocks/BlockQuote';
import { BlockDivider } from './blocks/BlockDivider';
import { BlockChildPage } from './blocks/BlockChildPage';
import { BlockTodoList } from './blocks/lists/BlockTodoList';
import { BlockCallout } from './blocks/BlockCallout';
import { BlockBulletList } from './blocks/lists/BlockBulletList';
import { BlockNumberedList } from './blocks/lists/BlockNumberedList';
import { BlockToggleList } from './blocks/lists/BlockToggleList';
import BlockBookmark from './blocks/media/BlockBookmark';
import { BlockVideo } from './blocks/media/BlockVideo';
import { BlockEmbed } from './blocks/media/BlockEmbed';
import RenderNotionLink from './RenderNotionLink';
import TagRegistry from '../parser/TagRegistry';
import sanitizeTags from '../anki/sanitizeTags';
import BlockColumn from './blocks/lists/BlockColumn';
import getClozeDeletionCard from './helpers/getClozeDeletionCard';
import getInputCard from './helpers/getInputCard';
import getColumn from './helpers/getColumn';
import isColumnList from './helpers/isColumnList';
import isTesting from './helpers/isTesting';
import BlockEquation from './blocks/BlockEquation';
import renderFront from './helpers/renderFront';
import perserveNewlinesIfApplicable from './helpers/perserveNewlinesIfApplicable';

class BlockHandler {
  api: NotionAPIWrapper;
  exporter;
  skip: string[];
  firstPageTitle?: string;
  useAll: boolean = false;
  settings: Settings;

  constructor(exporter: CustomExporter, api: NotionAPIWrapper, settings: Settings) {
    this.exporter = exporter;
    this.api = api;
    this.skip = [];
    this.settings = settings;
  }

  async embedImage(c: GetBlockResponse): Promise<string> {
    if (this.settings.isTextOnlyBack || isTesting()) {
      return '';
    }
    /* @ts-ignore */
    const t = c.image.type;
    /* @ts-ignore */
    const url = c.image[t].url;

    const suffix = SuffixFrom(S3FileName(url));
    const newName = NewUniqueFileNameFrom(url) + (suffix || '');
    const imageRequest = await axios.get(url, { responseType: 'arraybuffer' });
    const contents = imageRequest.data;
    this.exporter.addMedia(newName, contents);
    return `<img src='${newName}' />`;
  }

  async embedAudioFile(c: GetBlockResponse): Promise<string> {
    if (this.settings.isTextOnlyBack || isTesting()) {
      return '';
    }
    /* @ts-ignore */
    const audio = c.audio;
    const url = audio.file.url;
    const newName = NewUniqueFileNameFrom(url);

    const audioRequest = await axios.get(url, { responseType: 'arraybuffer' });
    const contents = audioRequest.data;
    this.exporter.addMedia(newName, contents);
    /* @ts-ignore */
    return `[sound:${newName}]`;
  }

  async embedFile(c: GetBlockResponse): Promise<string> {
    if (this.settings.isTextOnlyBack || isTesting()) {
      return '';
    }
    /* @ts-ignore */
    const file = c.file;
    const url = file.file.url;
    const newName = NewUniqueFileNameFrom(url);
    const fileRequest = await axios.get(url, { responseType: 'arraybuffer' });
    const contents = fileRequest.data;
    this.exporter.addMedia(newName, contents);
    /* @ts-ignore */
    return `<embed src='${newName}' />`;
  }

  /**
   * Retrieve the back side of a toggle
   * @param block
   * @returns
   */
  async getBackSide(
    block: GetBlockResponse,
    handleChildren?: boolean
  ): Promise<string | null> {
    let response: ListBlockChildrenResponse | null;

    try {
      response = await this.api.getBlocks(block.id, this.useAll);
      /* @ts-ignore */
      const requestChildren = response.results;

      let back = '';
      for (const c of requestChildren) {
        // If the block has been handled before, skip it.
        // This can be true due to nesting
        if (this.skip.includes(c.id)) {
          continue;
        }
        /* @ts-ignore */
        switch (c.type) {
          case 'image':
            /* @ts-ignore */
            const image = await this.embedImage(c);
            back += image;
            break;
          case 'audio':
            /* @ts-ignore */
            const audio = await this.embedAudioFile(c);
            back += audio;
            break;
          case 'file':
            /* @ts-ignore */
            const file = await this.embedFile(c);
            back += file;
            break;
          case 'paragraph':
            back += await BlockParagraph(c, this);
            break;
          case 'code':
            back += BlockCode(c, this);
            break;
          case 'heading_1':
            back += await BlockHeading('heading_1', c, this);
            break;
          case 'heading_2':
            back += await BlockHeading('heading_2', c, this);
            break;
          case 'heading_3':
            back += await BlockHeading('heading_3', c, this);
            break;
          case 'quote':
            back += BlockQuote(c, this);
            break;
          case 'divider':
            back += BlockDivider();
            break;
          case 'child_page':
            back += await BlockChildPage(c, this);
            break;
          case 'to_do':
            back += BlockTodoList(c, this);
            break;
          case 'callout':
            back += BlockCallout(c, this);
            break;
          case 'bulleted_list_item':
            back += await BlockBulletList(block, response, this);
            break;
          case 'numbered_list_item':
            back += BlockNumberedList(c, this);
            break;
          case 'toggle':
            back += await BlockToggleList(c, this);
            break;
          case 'bookmark':
            back += await BlockBookmark(c, this);
            break;
          case 'video':
            back += BlockVideo(c, this);
            break;
          case 'embed':
            back += BlockEmbed(c, this);
            break;
          case 'column':
            back += await BlockColumn(c, this);
            break;
          case 'equation':
            back += BlockEquation(c);
            break;
          default:
            /* @ts-ignore */
            back += `unsupported: ${c.type}`;
            back += BlockDivider();
            back += `
          <pre>
          ${JSON.stringify(c, null, 4)}
          </pre>`;
            /* @ts-ignore */
            console.debug('unsupported ' + c.type);
        }

        // Nesting applies to all not just toggles
        if (
          handleChildren ||
          /* @ts-ignore */
          (c.has_children &&
            /* @ts-ignore */
            c.type !== 'toggle' &&
            /* @ts-ignore */
            c.type !== 'bulleted_list_item')
        ) {
          back += await this.getBackSide(c);
        }
      }
      return back;
    } catch (e: unknown) {
      console.error(e);
      return null;
    }
  }

  __notionLink(id: string, notionBaseLink: string | null): string | undefined {
    return notionBaseLink
      ? `${notionBaseLink}#${id.replace(/-/g, '')}`
      : undefined;
  }

  private async getFlashcards(
    rules: ParserRules,
    flashcardBlocks: GetBlockResponse[],
    tags: string[],
    settings: Settings
  ): Promise<Note[]> {
    let cards = [];

    if (!this.settings) {
      this.settings = settings;
    }

    let notionBaseLink = null;
    if (settings.addNotionLink && settings.parentBlockId) {
      const page = await this.api.getPage(settings.parentBlockId);
      /* @ts-ignore */
      if (page) notionBaseLink = page.url;
    }

    let counter = 0;
    for (const block of flashcardBlocks) {
        // Assume it's a basic card then check for children
        const name = await renderFront(block, this);
        let back: null | string = '';
        if (isColumnList(block) && rules.useColums())  {
          const secondColumn = await getColumn(block.id, this, 1);
          if (secondColumn) {
            back = await BlockColumn(secondColumn, this)
          }
        } else {
          back = await this.getBackSide(block);
        }
        const ankiNote = new Note(name, back || '');
        ankiNote.media = this.exporter.media;
        let isBasicType = true;
        // Look for cloze deletion cards
        if (settings.isCloze) {
          const clozeCard = await getClozeDeletionCard(rules, block);
          if (clozeCard) {
            isBasicType = false;
          }
          clozeCard && ankiNote.copyValues(clozeCard);
        }
        // Look for input cards
        if (settings.useInput) {
          const inputCard = await getInputCard(rules, block);
          if (inputCard) {
            isBasicType = false;
          }
          inputCard && ankiNote.copyValues(inputCard);
        }

        ankiNote.back = back!;
        ankiNote.notionLink = this.__notionLink(block.id, notionBaseLink);
        if (settings.addNotionLink) {
          ankiNote.back += RenderNotionLink(ankiNote.notionLink!, this);
        }
        ankiNote.notionId = settings.useNotionId ? block.id : undefined;
        ankiNote.media = this.exporter.media;
        this.exporter.media = [];

        const tr = TagRegistry.getInstance();
        ankiNote.tags =
          rules.TAGS === 'heading' ? tr.headings : tr.strikethroughs;
        ankiNote.number = counter++;

        ankiNote.name = perserveNewlinesIfApplicable(ankiNote.name, settings);
        ankiNote.back = perserveNewlinesIfApplicable(ankiNote.back, settings);

        cards.push(ankiNote);
        if (
          !settings.isCherry &&
          (settings.basicReversed || ankiNote.hasRefreshIcon()) 
          && isBasicType) {
          cards.push(ankiNote.reversed(ankiNote));
        }
        tr.clear();
    }

    if (settings.isCherry) {
      cards = cards.filter((c) => {
        return c.hasCherry();
      });
    }
    if (settings.isAvocado) {
      cards = cards.filter((c) => {
        return !c.hasAvocado();
      });
    }

    if (settings.useTags && tags.length > 0) {
      cards.forEach((c) => {
        c.tags ||= [];
        c.tags = tags.concat(sanitizeTags(c.tags));
      });
    }
    return cards; // .filter((c) => !c.isValid());
  }


  async findFlashcards(
    topLevelId: string,
    rules: ParserRules,
    settings: Settings,
    decks: Deck[],
    parentName: string = ''
  ): Promise<Deck[]> {
    if (rules.DECK === 'page') {
      return this.findFlashcardsFromPage(
        topLevelId,
        rules,
        settings,
        decks,
        parentName
      );
    } else if (rules.DECK === 'database') {
      const dbResult = await this.api.queryDatabase(topLevelId);
      const database = await this.api.getDatabase(topLevelId);
      const dbName = this.api.getDatabaseTitle(database, settings);
      for (const entry of dbResult.results) {
        decks = await this.findFlashcardsFromPage(
          entry.id,
          rules,
          settings,
          decks,
          dbName
        );
      }
    }
    return decks;
  }

  async findFlashcardsFromPage(
    topLevelId: string,
    rules: ParserRules,
    settings: Settings,
    decks: Deck[],
    parentName: string = ''
  ): Promise<Deck[]> {
    const tags = await this.api.getTopLevelTags(topLevelId, rules);
    const response = await this.api.getBlocks(topLevelId, rules.UNLIMITED);
    const blocks = response.results;
    const flashCardTypes = rules.flaschardTypeNames();
    // Locate the card blocks to be used from the parser rules
    const cBlocks = blocks.filter((b: GetBlockResponse) =>
      /* @ts-ignore */
      flashCardTypes.includes(b.type)
    );
    const page = await this.api.getPage(topLevelId);
    if (!page) {
      console.info(`No page found for ${topLevelId}`);
      return [];
    }
    const title = await this.api.getPageTitle(page, settings);
    if (!this.firstPageTitle) {
      this.firstPageTitle = title;
    }
    settings.parentBlockId = page.id;
    const cards = await this.getFlashcards(rules, cBlocks, tags, settings);
    const NOTION_STYLE = fs.readFileSync(
      path.join(__dirname, '../../templates/notion.css'),
      'utf8'
    );
    const deck = new Deck(
      parentName ? `${parentName}::${title}` : title,
      cards,
      undefined,
      NOTION_STYLE,
      Deck.GenerateId(),
      settings
    );
    decks.push(deck);

    if (settings.isAll) {
      /* @ts-ignore */
      const subDecks = blocks.filter((b) => b.type === rules.SUB_DECKS);
      for (const sd of subDecks) { 
        const subPage = await this.api.getPage(sd.id);
        if (subPage) {
          const nested = await this.findFlashcardsFromPage(
            sd.id,
            rules,
            settings,
            decks,
            deck.name
          );
          decks = nested;
        }
      }
    }
    return decks;
  }
}

export default BlockHandler;
