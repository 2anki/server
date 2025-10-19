import { isFullBlock, isFullPage } from '@notionhq/client';
import {
  AudioBlockObjectResponse,
  BlockObjectResponse,
  FileBlockObjectResponse,
  GetBlockResponse,
  ImageBlockObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
  ToggleBlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';
import axios from 'axios';

import getDeckName from '../../../lib/anki/getDeckname';
import sanitizeTags from '../../../lib/anki/sanitizeTags';
import { S3FileName, SuffixFrom } from '../../../lib/misc/file';
import getUniqueFileName from '../../../lib/misc/getUniqueFileName';
import Deck from '../../../lib/parser/Deck';
import Note from '../../../lib/parser/Note';
import ParserRules from '../../../lib/parser/ParserRules';
import CardOption from '../../../lib/parser/Settings';
import TagRegistry from '../../../lib/parser/TagRegistry';
import CustomExporter from '../../../lib/parser/exporters/CustomExporter';
import get16DigitRandomId from '../../../shared/helpers/get16DigitRandomId';
import { NOTION_STYLE } from '../../../templates/helper';
import NotionAPIWrapper from '../NotionAPIWrapper';
import BlockColumn from '../blocks/lists/BlockColumn';
import { blockToStaticMarkup } from '../helpers/blockToStaticMarkup';
import { getAudioUrl } from '../helpers/getAudioUrl';
import getClozeDeletionCard from '../helpers/getClozeDeletionCard';
import getColumn from '../helpers/getColumn';
import { getFileUrl } from '../helpers/getFileUrl';
import { getImageUrl } from '../helpers/getImageUrl';
import getInputCard from '../helpers/getInputCard';
import isColumnList from '../helpers/isColumnList';
import isTesting from '../helpers/isTesting';
import perserveNewlinesIfApplicable from '../helpers/preserveNewlinesIfApplicable';
import { renderBack } from '../helpers/renderBack';
import renderTextChildren from '../helpers/renderTextChildren';
import { toText } from './helpers/deckNameToText';
import getSubDeckName from './helpers/getSubDeckName';
import RenderNotionLink from './RenderNotionLink';

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

  settings: CardOption;

  constructor(
    exporter: CustomExporter,
    api: NotionAPIWrapper,
    settings: CardOption
  ) {
    this.exporter = exporter;
    this.api = api;
    this.skip = [];
    this.settings = settings;
  }

  async embedImage(c: BlockObjectResponse): Promise<string> {
    const url = getImageUrl(c as ImageBlockObjectResponse);
    if (this.settings.isTextOnlyBack || isTesting() || !url) {
      return '';
    }

    const suffix = SuffixFrom(S3FileName(url));
    const newName = getUniqueFileName(url) + (suffix ?? '');
    const imageRequest = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const contents = imageRequest.data;
    this.exporter.addMedia(newName, contents);
    return `<img src="${newName}" />`;
  }

  async embedAudioFile(c: AudioBlockObjectResponse): Promise<string> {
    const url = getAudioUrl(c);
    if (this.settings.isTextOnlyBack || isTesting() || !url) {
      return '';
    }
    const newName = getUniqueFileName(url);

    const audioRequest = await axios.get(url, { responseType: 'arraybuffer' });
    const contents = audioRequest.data;
    this.exporter.addMedia(newName, contents);
    return `[sound:${newName}]`;
  }

  async embedFile(block: FileBlockObjectResponse): Promise<string> {
    const url = getFileUrl(block);
    if (this.settings.isTextOnlyBack || isTesting() || !url) {
      return '';
    }
    const newName = getUniqueFileName(url);
    const fileRequest = await axios.get(url, { responseType: 'arraybuffer' });
    const contents = fileRequest.data;
    this.exporter.addMedia(newName, contents);
    return `<embed src="${newName}" />`;
  }

  /**
   * Retrieve the back side of a toggle
   * @param block
   * @param handleChildren
   * @returns
   */
  async getBackSide(
    block: BlockObjectResponse,
    handleChildren?: boolean
  ): Promise<string | null> {
    let response2: ListBlockChildrenResponse | null;
    try {
      response2 = await this.api.getBlocks({
        createdAt: block.created_time,
        lastEditedAt: block.last_edited_time,
        id: block.id,
        all: this.useAll,
        type: block.type,
      });
      const requestChildren = response2.results;
      return await renderBack(this, requestChildren, response2, handleChildren);
    } catch (e: unknown) {
      console.info('Get back side failed');
      console.error(e);
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

  async getFlashcards(
    rules: ParserRules,
    flashcardBlocks: GetBlockResponse[],
    tags: string[],
    notionBaseLink: string | undefined
  ): Promise<Note[]> {
    let cards = [];
    let counter = 0;

    for (const block of flashcardBlocks) {
      let name: string;
      let back: null | string = '';
      
      // Handle toggle blocks specially for flashcard extraction
      if (isFullBlock(block) && (block as BlockObjectResponse).type === 'toggle') {
        // For toggle blocks, extract only the summary (question) for the front
        const toggleBlock = block as ToggleBlockObjectResponse;
        const richText = toggleBlock.toggle.rich_text;
        
        // Render the toggle's rich_text (summary) as HTML for the front
        // Always preserve newlines in toggle summaries by converting \n to <br />
  name = renderTextChildren(richText, this.settings).replaceAll('\n', '<br />');
        
        // Get the children content for the back (answer)
        back = await this.getBackSide(block as BlockObjectResponse);
      } else {
        // For non-toggle blocks, use the existing logic
        name = await blockToStaticMarkup(
          this,
          block as BlockObjectResponse
        );
        
        if (isColumnList(block) && rules.useColums()) {
          const secondColumn = await getColumn(block.id, this, 1);
          if (secondColumn) {
            back = await BlockColumn(secondColumn, this);
          }
        } else {
          back = await this.getBackSide(block as BlockObjectResponse);
        }
      }
      
      if (!name) {
        console.debug('name is not valid for front, skipping', name, back);
        continue;
      }
      
      const ankiNote = new Note(name, back ?? '');
      ankiNote.media = this.exporter.media;
      let isBasicType = true;
      // Look for cloze deletion cards
      if (this.settings.isCloze) {
        const clozeCard = await getClozeDeletionCard(block);
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

      ankiNote.back = back || '';
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
      if (ankiNote.back) {
        ankiNote.back = perserveNewlinesIfApplicable(
          ankiNote.back,
          this.settings
        );
      }

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
      const dbName = await this.api.getDatabaseTitle(database, this.settings);
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
      throw new Error(
        `
        Unsupported '${parentType}'!
        Please report a bug.
        `
      );
    }
    return decks;
  }

  async findFlashcardsFromPage(locator: Finder): Promise<Deck[]> {
    const { topLevelId, rules, parentName } = locator;
    let { decks } = locator;

    const page = await this.api.getPage(topLevelId);
    const tags = await this.api.getTopLevelTags(topLevelId, rules);
    const response = await this.api.getBlocks({
      createdAt: (page as PageObjectResponse).created_time,
      lastEditedAt: (page as PageObjectResponse).last_edited_time,
      id: topLevelId,
      all: rules.UNLIMITED,
      type: 'page',
    });
    const blocks = response.results;
    const flashCardTypes = rules.flaschardTypeNames();

    const title = await this.api.getPageTitle(page, this.settings);
    if (!this.firstPageTitle) {
      this.firstPageTitle = title;
    }
    
    if (rules.permitsDeckAsPage() && page) {
      // Locate the card blocks to be used from the parser rules
      const cBlocks = blocks.filter((b: GetBlockResponse) => {
        if (!isFullBlock(b)) {
          return false;
        }
        return flashCardTypes.includes(b.type);
      });
      this.settings.parentBlockId = page.id;

      let notionBaseLink =
        this.settings.addNotionLink && this.settings.parentBlockId
          ? isFullPage(page)
            ? page?.url
            : undefined
          : undefined;
      const cards = await this.getFlashcards(
        rules,
        cBlocks,
        tags,
        notionBaseLink
      );
      const deck = new Deck(
        toText(getDeckName(parentName, title)),
        Deck.CleanCards(cards),
        undefined,
        NOTION_STYLE,
        get16DigitRandomId(),
        this.settings
      );

      decks.push(deck);
    }

    if (this.settings.isAll) {
      const subDecks = blocks.filter((b) => {
        if ('type' in b) {
          return rules.SUB_DECKS.includes(b.type);
        }
      });

      for (const sd of subDecks) {
        if (isFullBlock(sd)) {
          if (
            sd.type === 'child_database' &&
            rules.SUB_DECKS.includes('child_database')
          ) {
            const dbDecks = await this.handleChildDatabase(sd, rules);
            decks.push(...dbDecks);
            continue;
          }

          const res = await this.api.getBlocks({
            createdAt: sd.created_time,
            lastEditedAt: sd.last_edited_time,
            id: sd.id,
            all: rules.UNLIMITED,
            type: sd.type,
          });
          let cBlocks = res.results.filter((b: GetBlockResponse) =>
            flashCardTypes.includes((b as BlockObjectResponse).type)
          );

          this.settings.parentBlockId = sd.id;
          const cards = await this.getFlashcards(
            rules,
            cBlocks,
            tags,
            undefined
          );
          let subDeckName = getSubDeckName(sd);

          decks.push(
            new Deck(
              getDeckName(
                this.settings.deckName || this.firstPageTitle,
                subDeckName
              ),
              cards,
              undefined,
              NOTION_STYLE,
              get16DigitRandomId(),
              this.settings
            )
          );
          continue;
        }
        const subPage = await this.api.getPage(sd.id);
        if (subPage && isFullBlock(sd)) {
          decks = await this.findFlashcardsFromPage({
            parentType: sd.type,
            topLevelId: sd.id,
            rules,
            decks,
            parentName: parentName,
          });
        }
      }
    }
    console.log('have ', decks.length, ' decks so far');
    return decks;
  }

  private async handleChildDatabase(
    sd: BlockObjectResponse,
    rules: ParserRules
  ): Promise<Deck[]> {
    const dbResult = await this.api.queryDatabase(sd.id);
    const database = await this.api.getDatabase(sd.id);
    const dbName = await this.api.getDatabaseTitle(database, this.settings);
    let dbDecks: Deck[] = [];

    for (const entry of dbResult.results) {
      const entryDecks = await this.findFlashcardsFromPage({
        parentType: 'database',
        topLevelId: entry.id,
        rules,
        decks: [],
        parentName: dbName,
      });
      dbDecks.push(...entryDecks);
    }
    return dbDecks;
  }
}

export default BlockHandler;
