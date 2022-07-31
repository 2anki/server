import path from 'path';
import fs from 'fs';

import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from '@notionhq/client/build/src/api-endpoints';
import axios from 'axios';
import NotionAPIWrapper from './NotionAPIWrapper';
import Note from '../parser/Note';
import Settings from '../parser/Settings';
import ParserRules from '../parser/ParserRules';
import Deck from '../parser/Deck';
import CustomExporter from '../parser/CustomExporter';
import { S3FileName, SuffixFrom } from '../misc/file';
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
import perserveNewlinesIfApplicable from './helpers/preserveNewlinesIfApplicable';
import getDeckName from '../anki/getDeckname';
import LinkToPage from './blocks/LinkToPage';
import getUniqueFileName from '../misc/getUniqueFileName';
import getSubDeckName from './helpers/getSubDeckName';
import { captureException } from '@sentry/node';

interface Finder {
  parentType: string;
  topLevelId: string;
  rules: ParserRules;
  decks: Deck[];
  parentName: string;
}

class BlockHandler {
  api: NotionAPIWrapper;

  exporter;

  skip: string[];

  firstPageTitle?: string;

  useAll: boolean = false;

  settings: Settings;

  constructor(
    exporter: CustomExporter,
    api: NotionAPIWrapper,
    settings: Settings
  ) {
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
    const { url } = c.image[t];

    const suffix = SuffixFrom(S3FileName(url));
    const newName = getUniqueFileName(url) + (suffix || '');
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
    const { audio } = c;
    const { url } = audio.file;
    const newName = getUniqueFileName(url);

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
    const { file } = c;
    const { url } = file.file;
    const newName = getUniqueFileName(url);
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
            back += await BlockTodoList(c, response, this);
            break;
          case 'callout':
            back += BlockCallout(c, this);
            break;
          case 'bulleted_list_item':
            back += await BlockBulletList(c, response, this);
            break;
          case 'numbered_list_item':
            back += await BlockNumberedList(c, response, this);
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
          case 'link_to_page':
            back += await LinkToPage(c, this);
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
            console.debug(`unsupported ${c.type}`);
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
      captureException(e);
      return null;
    }
  }

  __notionLink(
    id: string,
    notionBaseLink: string | undefined
  ): string | undefined {
    return notionBaseLink
      ? `${notionBaseLink}#${id.replace(/-/g, '')}`
      : undefined;
  }

  private async getFlashcards(
    rules: ParserRules,
    flashcardBlocks: GetBlockResponse[],
    tags: string[],
    notionBaseLink: string | undefined
  ): Promise<Note[]> {
    let cards = [];
    let counter = 0;

    for (const block of flashcardBlocks) {
      // Assume it's a basic card then check for children
      const name = await renderFront(block, this);
      let back: null | string = '';
      if (isColumnList(block) && rules.useColums()) {
        const secondColumn = await getColumn(block.id, this, 1);
        if (secondColumn) {
          back = await BlockColumn(secondColumn, this);
        }
      } else {
        back = await this.getBackSide(block);
      }
      const ankiNote = new Note(name, back || '');
      ankiNote.media = this.exporter.media;
      let isBasicType = true;
      // Look for cloze deletion cards
      if (this.settings.isCloze) {
        const clozeCard = await getClozeDeletionCard(rules, block);
        if (clozeCard) {
          isBasicType = false;
          ankiNote.copyValues(clozeCard);
        }
      }
      // Look for input cards
      if (this.settings.useInput) {
        const inputCard = await getInputCard(rules, block);
        if (inputCard) {
          isBasicType = false;
          ankiNote.copyValues(inputCard);
        }
      }

      ankiNote.back = back!;
      ankiNote.notionLink = this.__notionLink(block.id, notionBaseLink);
      if (this.settings.addNotionLink) {
        ankiNote.back += RenderNotionLink(ankiNote.notionLink!, this);
      }
      ankiNote.notionId = this.settings.useNotionId ? block.id : undefined;
      ankiNote.media = this.exporter.media;
      this.exporter.media = [];

      const tr = TagRegistry.getInstance();
      ankiNote.tags =
        rules.TAGS === 'heading' ? tr.headings : tr.strikethroughs;
      ankiNote.number = counter++;

      ankiNote.name = perserveNewlinesIfApplicable(
        ankiNote.name,
        this.settings
      );
      ankiNote.back = perserveNewlinesIfApplicable(
        ankiNote.back,
        this.settings
      );

      cards.push(ankiNote);
      if (
        !this.settings.isCherry &&
        (this.settings.basicReversed || ankiNote.hasRefreshIcon()) &&
        isBasicType
      ) {
        cards.push(ankiNote.reversed(ankiNote));
      }
      tr.clear();
    }

    if (this.settings.isCherry) {
      cards = cards.filter((c) => c.hasCherry());
    }
    if (this.settings.isAvocado) {
      cards = cards.filter((c) => !c.hasAvocado());
    }

    if (this.settings.useTags && tags.length > 0) {
      cards.forEach((c) => {
        c.tags ||= [];
        c.tags = tags.concat(sanitizeTags(c.tags));
      });
    }
    return cards; // .filter((c) => !c.isValid());
  }

  async findFlashcards(locator: Finder): Promise<Deck[]> {
    const { parentType, topLevelId, rules, decks } = locator;
    if (parentType === 'page') {
      return this.findFlashcardsFromPage(locator);
    } else if (parentType === 'database') {
      const dbResult = await this.api.queryDatabase(topLevelId);
      const database = await this.api.getDatabase(topLevelId);
      const dbName = this.api.getDatabaseTitle(database, this.settings);
      let dbDecks = [];
      for (const entry of dbResult.results) {
        dbDecks = await this.findFlashcardsFromPage({
          parentType: 'database',
          topLevelId: entry.id,
          rules,
          decks,
          parentName: dbName,
        });
        return dbDecks;
      }
    } else {
      // in the case user selects something other than db and page
      // search in both database and page
    }
    return decks;
  }

  async findFlashcardsFromPage(locator: Finder): Promise<Deck[]> {
    const { topLevelId, rules, parentName, parentType } = locator;
    let { decks } = locator;

    const tags = await this.api.getTopLevelTags(topLevelId, rules);
    const response = await this.api.getBlocks(topLevelId, rules.UNLIMITED);
    const blocks = response.results;
    const flashCardTypes = rules.flaschardTypeNames();

    const page = await this.api.getPage(topLevelId);
    const title = await this.api.getPageTitle(page, this.settings);
    if (!this.firstPageTitle) {
      this.firstPageTitle = title;
    }
    if (rules.permitsDeckAsPage() && parentType === 'page' && page) {
      // Locate the card blocks to be used from the parser rules
      const cBlocks = blocks.filter((b: GetBlockResponse) =>
        /* @ts-ignore */
        flashCardTypes.includes(b.type)
      );
      this.settings.parentBlockId = page.id;

      let notionBaseLink =
        this.settings.addNotionLink && this.settings.parentBlockId
          ? /* @ts-ignore */
            page?.url
          : undefined;
      const cards = await this.getFlashcards(
        rules,
        cBlocks,
        tags,
        notionBaseLink
      );
      const NOTION_STYLE = fs.readFileSync(
        path.join(__dirname, '../../templates/notion.css'),
        'utf8'
      );
      const deck = new Deck(
        getDeckName(parentName, title),
        cards,
        undefined,
        NOTION_STYLE,
        Deck.GenerateId(),
        this.settings
      );

      decks.push(deck);
    }

    if (this.settings.isAll) {
      /* @ts-ignore */
      const subDecks = blocks.filter((b) => rules.SUB_DECKS.includes(b.type));
      for (const sd of subDecks) {
        /* @ts-ignore */
        const subDeckType = sd.type;
        if (subDeckType !== 'page') {
          console.log('sd.type', subDeckType);
          const res = await this.api.getBlocks(sd.id, rules.UNLIMITED);
          const cBlocks = res.results.filter((b: GetBlockResponse) =>
            /* @ts-ignore */
            flashCardTypes.includes(b.type)
          );

          this.settings.parentBlockId = sd.id;
          const cards = await this.getFlashcards(
            rules,
            cBlocks,
            tags,
            undefined
          );
          const NOTION_STYLE = fs.readFileSync(
            path.join(__dirname, '../../templates/notion.css'),
            'utf8'
          );
          /* @ts-ignore */
          const block = sd[sd.type];
          let subDeckName = getSubDeckName(block);

          decks.push(
            new Deck(
              /* @ts-ignore */
              getDeckName(
                this.settings.deckName || this.firstPageTitle,
                subDeckName
              ),
              cards,
              undefined,
              NOTION_STYLE,
              Deck.GenerateId(),
              this.settings
            )
          );
          continue;
        }
        const subPage = await this.api.getPage(sd.id);
        if (subPage) {
          /* @ts-ignore */
          const nested = await this.findFlashcardsFromPage({
            /* @ts-ignore */
            parentType: sd.type,
            topLevelId: sd.id,
            rules,
            decks,
            parentName: parentName,
          });
          decks = nested;
        }
      }
    }
    return decks;
  }
}

export default BlockHandler;
