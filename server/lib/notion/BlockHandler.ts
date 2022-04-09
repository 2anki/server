import path from "path";
import fs from "fs";

import NotionAPIWrapper from "./NotionAPIWrapper";
import Note from "../parser/Note";
import Settings from "../parser/Settings";
import ParserRules from "../parser/ParserRules";
import Deck from "../parser/Deck";
import CustomExporter from "../parser/CustomExporter";
import {
  GetBlockResponse,
  ListBlockChildrenResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NewUniqueFileNameFrom, S3FileName, SuffixFrom } from "../misc/file";
import axios from "axios";
import BlockParagraph from "./blocks/BlockParagraph";
import BlockCode from "./blocks/BlockCode";
import FrontFlashcard from "./blocks/FrontFlashcard";
import {
  BlockHeading1,
  BlockHeading2,
  BlockHeading3,
  IsTypeHeading,
} from "./blocks/BlockHeadings";
import { BlockQuote } from "./blocks/BlockQuote";
import { BlockDivider } from "./blocks/BlockDivider";
import { BlockChildPage } from "./blocks/BlockChildPage";
import { BlockTodoList } from "./blocks/lists/BlockTodoList";
import { BlockCallout } from "./blocks/BlockCallout";
import { BlockBulletList } from "./blocks/lists/BlockBulletList";
import { BlockNumberedList } from "./blocks/lists/BlockNumberedList";
import { BlockToggleList } from "./blocks/lists/BlockToggleList";
import BlockBookmark from "./blocks/media/BlockBookmark";
import { BlockVideo } from "./blocks/media/BlockVideo";
import { BlockEmbed } from "./blocks/media/BlockEmbed";
import RenderNotionLink from "./NotionLink";
import TagRegistry from "../parser/TagRegistry";

class BlockHandler {
  api: NotionAPIWrapper;
  exporter;
  skip: string[];
  firstPageTitle?: string;
  useAll: boolean = false;
  settings?: Settings;

  constructor(exporter: CustomExporter, api: NotionAPIWrapper) {
    this.exporter = exporter;
    this.api = api;
    this.skip = [];
  }

  async embedImage(c: GetBlockResponse): Promise<string> {
    console.debug("embedImage: " + c.id);
    /* @ts-ignore */
    const t = c.image.type;
    /* @ts-ignore */
    const file = c.image[t];
    const expiry = new Date(file.expiry_time);
    const now = new Date();
    /* @ts-ignore */
    const url = c.image[t].url;

    const suffix = SuffixFrom(S3FileName(url));
    const newName = NewUniqueFileNameFrom(url) + (suffix || "");
    console.debug("rewrite image to " + newName);
    const imageRequest = await axios.get(url, { responseType: "arraybuffer" });
    const contents = imageRequest.data;
    this.exporter.addMedia(newName, contents);
    return `<img src='${newName}' />`;
  }

  async embedAudioFile(c: GetBlockResponse): Promise<string> {
    console.debug("embedAudioFile: " + c.id);
    /* @ts-ignore */
    const audio = c.audio;
    const url = audio.file.url;
    const newName = NewUniqueFileNameFrom(url);

    const audioRequest = await axios.get(url, { responseType: "arraybuffer" });
    const contents = audioRequest.data;
    this.exporter.addMedia(newName, contents);
    /* @ts-ignore */
    return `[sound:${newName}]`;
  }

  async embedFile(c: GetBlockResponse): Promise<string> {
    console.debug("embedFile: " + c.id);
    /* @ts-ignore */
    const file = c.file;
    const url = file.file.url;
    const newName = NewUniqueFileNameFrom(url);
    const fileRequest = await axios.get(url, { responseType: "arraybuffer" });
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
    console.debug("getBackSide: " + block.id);
    let response: ListBlockChildrenResponse | null;
    console.debug(
      /* @ts-ignore */
      `getBackSide id=${block.id}, edited=${block.last_edited_time}, type=${block.type}`
    );

    try {
      response = await this.api.getBlocks(block.id, this.useAll);
      /* @ts-ignore */
      const requestChildren = response.results;

      let back = "";
      for (const c of requestChildren) {
        // If the block has been handled before, skip it.
        // This can be true due to nesting
        if (this.skip.includes(c.id)) {
          continue;
        }
        /* @ts-ignore */
        switch (c.type) {
          case "image":
            /* @ts-ignore */
            const image = await this.embedImage(c);
            back += image;
            break;
          case "audio":
            /* @ts-ignore */
            const audio = await this.embedAudioFile(c);
            back += audio;
            break;
          case "file":
            /* @ts-ignore */
            const file = await this.embedFile(c);
            back += file;
            break;
          case "paragraph":
            back += BlockParagraph(c);
            break;
          case "code":
            back += BlockCode(c);
            break;
          case "heading_1":
            back += await BlockHeading1(c, this);
            break;
          case "heading_2":
            back += await BlockHeading2(c, this);
            break;
          case "heading_3":
            back += await BlockHeading3(c, this);
            break;
          case "quote":
            back += BlockQuote(c);
            break;
          case "divider":
            back += BlockDivider();
            break;
          case "child_page":
            back += await BlockChildPage(c, this.api);
            break;
          case "to_do":
            back += BlockTodoList(c);
            break;
          case "callout":
            back += BlockCallout(c);
            break;
          case "bulleted_list_item":
            back += await BlockBulletList(block, response, this);
            break;
          case "numbered_list_item":
            back += BlockNumberedList(c);
            break;
          case "toggle":
            back += await BlockToggleList(c, this);
            break;
          case "bookmark":
            back += await BlockBookmark(c);
            break;
          case "video":
            back += BlockVideo(c);
            break;
          case "embed":
            back += BlockEmbed(c);
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
            console.debug("unsupported " + c.type);
        }

        // Nesting applies to all not just toggles
        if (
          handleChildren ||
          /* @ts-ignore */
          (c.has_children &&
            /* @ts-ignore */
            c.type !== "toggle" &&
            /* @ts-ignore */
            c.type !== "bulleted_list_item")
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
      ? `${notionBaseLink}#${id.replace(/-/g, "")}`
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

    const flashCardTypes = rules.flaschardTypeNames();
    console.log("flashCardTypes", flashCardTypes);
    for (const block of flashcardBlocks) {
      for (const FLASHCARD of flashCardTypes) {
        /* @ts-ignore */
        const flashcardBlock = block[FLASHCARD];
        if (!flashcardBlock) continue;
        // Assume it's a basic card then check for children
        const name = await this.renderFront(block);
        const back = await this.getBackSide(block);
        const ankiNote = new Note(name, back || "");
        ankiNote.media = this.exporter.media;
        /* @ts-ignore */
        if (block.has_children) {
          // Look for cloze deletion cards
          if (settings.isCloze) {
            const clozeCard = await this.getClozeDeletionCard(rules, block);
            clozeCard && ankiNote.copyValues(clozeCard);
          }
          // Look for input cards
          if (settings.useInput) {
            const inputCard = await this.getInputCard(rules, block);
            inputCard && ankiNote.copyValues(inputCard);
          }
        }
        // Flashcard block has no children but uses cloze
        else {
          if (settings.isCloze) {
            const clozeCard = await this.getClozeDeletionCard(rules, block);
            clozeCard && ankiNote.copyValues(clozeCard);
          }
          if (settings.useInput) {
            const inputCard = await this.getInputCard(rules, block);
            inputCard && ankiNote.copyValues(inputCard);
          }
        }

        ankiNote.back = back!;
        ankiNote.notionLink = this.__notionLink(block.id, notionBaseLink);
        if (settings.addNotionLink) {
          ankiNote.back += RenderNotionLink(ankiNote.notionLink!);
        }
        ankiNote.notionId = settings.useNotionId ? block.id : undefined;
        ankiNote.media = this.exporter.media;
        this.exporter.media = [];

        console.debug(`Add Flashcard: ${ankiNote.name}`);
        const tr = TagRegistry.getInstance();
        ankiNote.tags =
          rules.TAGS === "heading" ? tr.headings : tr.strikethroughs;
        cards.push(ankiNote);
        tr.clear();
      }
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
      cards.map((c) => {
        c.tags ||= [];
        c.tags = tags.concat(c.tags);
      });
    }
    return cards; // .filter((c) => !c.isValid());
  }

  renderFront(block: GetBlockResponse) {
    /* @ts-ignore */
    const type = block.type;
    if (IsTypeHeading(block)) {
      switch (type) {
        case "heading_1":
          return BlockHeading1(block);
        case "heading_2":
          return BlockHeading2(block);
        case "heading_3":
          return BlockHeading3(block);
      }
    }
    /* @ts-ignore */
    return FrontFlashcard(block[type]);
  }

  // The user wants to turn code blocks into cloze deletions <code>word</code> becomes {{c1::word}}
  // This all should be tested with Jest
  async getClozeDeletionCard(
    rules: ParserRules,
    block: GetBlockResponse
  ): Promise<Note | undefined> {
    let isCloze = false;
    let name = "";
    let index = 1;
    const flashCardTypes = rules.flaschardTypeNames();
    for (const FLASHCARD of flashCardTypes) {
      // @ts-ignore
      const flashcardBlock = block[FLASHCARD];
      if (!flashcardBlock) continue;
      for (const cb of flashcardBlock.text) {
        if (cb.annotations.code) {
          const content = cb.text.content;
          if (content.includes("::")) {
            if (content.match(/(c|C)\d+::/)) {
              name += `{{${content}}}`;
            } else {
              const clozeIndex = "{{c"+index+"::"
              if (!name.includes(clozeIndex)) {
                name += `{{c${index}::${content}}}`;
              }
            }
          } else {
            name += `{{c${index}::${content}}}`;
          }
          name = name.replace("{{{{", "{{").replace("}}}}", "}}");
          isCloze = true;
          index++;
        } else {
          name += cb.text.content;
        }
      }
    }
    if (isCloze) {
      const note = new Note(name, "");
      note.cloze = isCloze;
      return note;
    }
    return undefined;
  }

  // The user wants to turn under lines into input cards <strong>keyword</strong> becomes {{type::word}}
  async getInputCard(
    rules: ParserRules,
    block: GetBlockResponse
  ): Promise<Note | undefined> {
    let isInput = false;
    let name = "";
    let answer = "";
    const flashCardTypes = rules.flaschardTypeNames();
    for (const FLASHCARD of flashCardTypes) {
      // @ts-ignore
      const flashcardBlock = block[FLASHCARD];
      if (!flashcardBlock) continue;
      for (const cb of flashcardBlock.text) {
        if (cb.annotations.underline || cb.annotations.bold) {
          answer += cb.text.content;
          isInput = true;
        } else {
          name += cb.text.content;
        }
      }
    }
    if (isInput) {
      const note = new Note(name, "");
      note.enableInput = isInput;
      note.answer = answer;
      return note;
    }
    return undefined;
  }

  async findFlashcards(
    topLevelId: string,
    rules: ParserRules,
    settings: Settings,
    decks: Deck[],
    parentName: string = ""
  ): Promise<Deck[]> {
    console.debug("findFlashcards for " + topLevelId);
    if (rules.DECK === "page") {
      return this.findFlashcardsFromPage(
        topLevelId,
        rules,
        settings,
        decks,
        parentName
      );
    } else if (rules.DECK === "database") {
      console.debug("findFlashcards from database");
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
    } else if (rules.DECK === "heading") {
      console.debug("findFlashcards from heading");
    }
    return decks;
  }

  async findFlashcardsFromPage(
    topLevelId: string,
    rules: ParserRules,
    settings: Settings,
    decks: Deck[],
    parentName: string = ""
  ): Promise<Deck[]> {
    const tags = await this.api.getTopLevelTags(topLevelId, rules);
    console.debug("Tags found: " + tags);
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
      path.join(__dirname, "../../templates/notion.css"),
      "utf8"
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
