import cheerio from 'cheerio';

import preserveNewlinesIfApplicable from '../../services/NotionService/helpers/preserveNewlinesIfApplicable';
import sanitizeTags from '../anki/sanitizeTags';
import { File } from '../zip/zip';
import Deck from './Deck';
import Note from './Note';
import Settings from './Settings';
import Workspace from './WorkSpace';
import CustomExporter from './exporters/CustomExporter';
import handleClozeDeletions from './helpers/handleClozeDeletions';
import replaceAll from './helpers/replaceAll';

import get16DigitRandomId from '../../shared/helpers/get16DigitRandomId';
import { isValidAudioFile } from '../anki/format';
import { sendError } from '../error/sendError';
import FallbackParser from './experimental/FallbackParser';
import { embedFile } from './exporters/embedFile';
import getYouTubeEmbedLink from './helpers/getYouTubeEmbedLink';
import getYouTubeID from './helpers/getYouTubeID';
import { isFileNameEqual } from '../storage/types';
import {
  isHTMLFile,
  isImageFileEmbedable,
  isMarkdownFile,
} from '../storage/checks';
import { getFileContents } from './getFileContents';
import { handleNestedBulletPointsInMarkdown } from './handleNestedBulletPointsInMarkdown';
import { checkFlashcardsLimits } from '../User/checkFlashcardsLimits';
import { extractStyles } from './extractStyles';
import { withFontSize } from './withFontSize';
import { transformDetailsTagToNotionToggleList } from './transformDetailsTagToNotionToggleList';
import { findNotionToggleLists } from './findNotionToggleLists';
import { NO_PACKAGE_ERROR } from '../error/constants';

export interface DeckParserInput {
  name: string;
  settings: Settings;
  files: File[];
  noLimits: boolean;
  workspace: Workspace;
}

export class DeckParser {
  globalTags: cheerio.Cheerio | null;

  firstDeckName: string;

  settings: Settings;

  payload: Deck[];

  files: File[];

  noLimits: boolean;

  public get name() {
    return this.payload[0].name;
  }

  constructor(input: DeckParserInput) {
    this.settings = input.settings;
    this.files = input.files || [];
    this.firstDeckName = input.name;
    this.noLimits = input.noLimits;
    this.globalTags = null;
    this.payload = [];
    this.processFirstFile(input.name);
  }

  processFirstFile(name: string) {
    const firstFile = this.files.find((file) => isFileNameEqual(file, name));

    if (this.settings.nestedBulletPoints && isMarkdownFile(name)) {
      const contents = getFileContents(firstFile, false);
      this.payload = handleNestedBulletPointsInMarkdown(
        name,
        contents?.toString(),
        this.settings.deckName,
        [],
        this.settings
      );
    } else if (isHTMLFile(name)) {
      const contents = getFileContents(firstFile, true);
      this.payload = contents
        ? this.handleHTML(
            name,
            contents.toString(),
            this.settings.deckName || '',
            []
          )
        : [];
    } else {
      this.payload = [];
    }
  }

  findNextPage(href: string | undefined): string | Uint8Array | undefined {
    if (!href) {
      console.debug(`skipping next page, due to href being ${href}`);
      return undefined;
    }
    const next = global.decodeURIComponent(href);
    const nextFile = this.files.find((file) =>
      file.name.match(next.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'))
    );
    return nextFile?.contents?.toString();
  }

  noteHasCherry(note: Note) {
    const cherry = '&#x1F352;';
    return (
      note.name.includes(cherry) ||
      note.back.includes(cherry) ||
      note.name.includes('🍒') ||
      note.back.includes('🍒')
    );
  }

  noteHasAvocado(note: Note) {
    const avocado = '&#x1F951';
    return note.name.includes(avocado) || note.name.includes('🥑');
  }

  findIndentedToggleLists(dom: cheerio.Root): cheerio.Element[] {
    const selector = '.page-body > details';
    return dom(selector).toArray();
  }

  removeNestedToggles(input: string) {
    return input
      .replace(/<details(.*?)>(.*?)<\/details>/g, '')
      .replace(/<summary>(.*?)<\/summary>/g, '')
      .replace(/<li><\/li>/g, '')
      .replace(/<ul[^/>][^>]*><\/ul>/g, '')
      .replace(/<\/details><\/li><\/ul><\/details><\/li><\/ul>/g, '')
      .replace(/<\/details><\/li><\/ul>/g, '')
      .replace(/<p[^/>][^>]*><\/p>/g, '')
      .replace('<summary class="toggle"></summary>', '');
  }

  getLink(pageId: string | undefined, note: Note): string | null {
    try {
      const page = pageId!.replace(/-/g, '');
      const link = `https://www.notion.so/${page}#${note.notionId}`;
      return `
                <a
                style="text-decoration: none; color: grey;"
                href="${link}">
                  Open in Notion
                </a>
                `;
    } catch (error) {
      console.info('experienced error while getting link');
      sendError(error);
      return null;
    }
  }

  removeNewlinesInSVGPathAttributeD(html: string): string {
    const dom = cheerio.load(html);
    const pathElements = dom('path');

    for (const pathElement of pathElements) {
      if ('attribs' in pathElement && 'd' in pathElement.attribs) {
        const dAttribute = pathElement.attribs.d;
        const newDAttribute = dAttribute.replace(/\n/g, '').trim();
        dom(pathElement).attr('d', newDAttribute);
      }
    }

    return dom.html();
  }

  getFirstHeadingText(dom: cheerio.Root) {
    try {
      const firstHeading = dom('h1').first();
      return firstHeading.text();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  handleHTML(
    fileName: string,
    contents: string,
    deckName: string,
    decks: Deck[]
  ) {
    let dom = this.loadDOM(contents);
    const style = withFontSize(extractStyles(dom), this.settings.fontSize);
    let image: string | undefined = this.extractCoverImage(dom);

    const name = this.extractName(
      deckName ||
        dom('title').text() ||
        this.getFirstHeadingText(dom) ||
        fileName ||
        'Default',
      this.extractPageIcon(dom),
      decks.length
    );

    // XXX: review this tag reassignment, does it overwrite?
    this.globalTags = this.extractGlobalTags(dom);

    const toggleList = this.extractToggleLists(dom);
    const paragraphs = this.extractCardsFromParagraph(dom);
    let cards: Note[] = this.extractCards(dom, toggleList);

    const disableIndentedBullets = this.settings.disableIndentedBulletPoints;
    // Note: this is a fallback behaviour until we can provide people more flexibility on picking non-toggles
    if (cards.length === 0) {
      cards.push(
        ...[
          ...this.extractCardsFromLists(dom, disableIndentedBullets),
          ...paragraphs,
        ]
      );
    } else if (this.settings.disableIndentedBulletPoints) {
      cards.push(
        ...[...this.extractCardsFromLists(dom, disableIndentedBullets)]
      );
    }

    //  Prevent bad cards from leaking out
    cards = cards.filter(Boolean);

    decks.push(
      new Deck(name, cards, image, style, get16DigitRandomId(), this.settings)
    );

    const subpages = dom('.link-to-page').toArray();
    for (const page of subpages) {
      const spDom = dom(page);
      const ref = spDom.find('a').first();
      const href = ref.attr('href');
      const pageContent = this.findNextPage(href);
      if (pageContent && name) {
        const subDeckName = spDom.find('title').text() || ref.text();
        this.handleHTML(
          fileName,
          pageContent.toString(),
          `${name}::${subDeckName}`,
          decks
        );
      }
    }
    return decks;
  }

  private extractGlobalTags(dom: cheerio.Root) {
    return dom('.page-body > p > del');
  }

  setupExporter(decks: Deck[], workspace: string) {
    for (const d of decks) {
      d.style = d.cleanStyle();
    }
    return new CustomExporter(this.firstDeckName, workspace);
  }

  // https://stackoverflow.com/questions/6903823/regex-for-youtube-id
  _getYouTubeID(input: string) {
    return this.ensureNotNull(input, () => {
      try {
        return getYouTubeID(input);
      } catch (error) {
        console.debug('error in getYouTubeID');
        sendError(error);
        return null;
      }
    });
  }

  ensureNotNull(input: string, cb: () => void) {
    if (!input || !input.trim()) {
      return null;
    }
    return cb();
  }

  getSoundCloudURL(input: string) {
    return this.ensureNotNull(input, () => {
      try {
        const sre = /https?:\/\/soundcloud\.com\/\S*/gi;
        const m = input.match(sre);
        if (!m || m.length === 0) {
          return null;
        }
        return m[0].split('">')[0];
      } catch (error) {
        console.debug('error in getSoundCloudURL');
        sendError(error);
        return null;
      }
    });
  }

  getMP3File(input: string) {
    return this.ensureNotNull(input, () => {
      try {
        const m = input.match(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/i);
        if (!m || m.length < 3) {
          return null;
        }
        const ma = m[2];
        if (!isValidAudioFile(ma) || ma.startsWith('http')) {
          return null;
        }
        return ma;
      } catch (error) {
        console.error(error);
        return null;
      }
    });
  }

  treatBoldAsInput(input: string, inline: boolean) {
    const dom = cheerio.load(input);
    const underlines = dom('strong');
    let mangle = input;
    let answer = '';
    underlines.each((_i, elem) => {
      const v = dom(elem).html();
      if (v) {
        const old = `<strong>${v}</strong>`;
        mangle = replaceAll(mangle, old, inline ? v : '{{type:Input}}');
        answer = v;
      }
    });
    return { mangle, answer };
  }

  locateTags(card: Note) {
    const input = [card.name, card.back];

    for (const i of input) {
      if (!i) {
        continue;
      }

      const dom = cheerio.load(i);
      const deletionsDOM = dom('del');
      const deletionsArray = [deletionsDOM, this.globalTags];
      if (!card.tags) {
        card.tags = [];
      }
      for (const deletions of deletionsArray) {
        if (!deletions) {
          continue;
        }
        deletions.each((_i: number, elem: cheerio.Element) => {
          const del = dom(elem);
          card.tags.push(...sanitizeTags(del.text().split(',')));
          card.back = replaceAll(card.back, `<del>${del.html()}</del>`, '');
          card.name = replaceAll(card.name, `<del>${del.html()}</del>`, '');
        });
      }
    }
    return card;
  }

  build(ws: Workspace) {
    const exporter = this.setupExporter(this.payload, ws.location);

    for (const d of this.payload) {
      const deck = d;
      deck.id = get16DigitRandomId();
      // Is it necessary to delete the style here?
      // delete deck.style;

      // Counter for perserving the order in Anki deck.
      let counter = 0;
      const addThese: Note[] = [];
      for (const c of deck.cards) {
        let card = c;
        card.enableInput = this.settings.useInput;
        card.cloze = this.settings.isCloze;
        card.number = counter++;

        if (card.cloze) {
          card.name = handleClozeDeletions(card.name);
        }

        if (this.settings.useInput && card.name.includes('<strong>')) {
          const inputInfo = this.treatBoldAsInput(card.name, false);
          card.name = inputInfo.mangle;
          card.answer = inputInfo.answer;
        }

        card.media = [];
        [card.name, card.back].forEach((content) => {
          if (content) {
            const dom = cheerio.load(content);
            const images = dom('img');
            const decodeURIComponent = global.decodeURIComponent;
            if (images.length > 0) {
              images.each((_i, elem) => {
                const originalName = dom(elem).attr('src');
                if (originalName && isImageFileEmbedable(originalName)) {
                  const newName = embedFile({
                    exporter,
                    files: this.files,
                    filePath: decodeURIComponent(originalName),
                    workspace: ws,
                  });
                  if (newName) {
                    dom(elem).attr('src', newName);
                    card.media.push(newName);
                  }
                }
              });
              if (content === card.name) {
                card.name = dom.html();
              } else {
                card.back = dom.html();
              }
            }
          }
        });

        const audiofile = this.getMP3File(card.back);
        if (audiofile) {
          if (this.settings.removeMP3Links) {
            card.back = card.back.replace(
              /<figure.*<a\shref=["'].*\.mp3["']>.*<\/a>.*<\/figure>/,
              ''
            );
          }
          const newFileName = embedFile({
            exporter,
            files: this.files,
            filePath: global.decodeURIComponent(audiofile),
            workspace: ws,
          });
          if (newFileName) {
            card.back += `[sound:${newFileName}]`;
            card.media.push(newFileName);
          }
        }
        // Check YouTube
        const id = this._getYouTubeID(card.back);
        if (id) {
          const ytSrc = getYouTubeEmbedLink(id);
          const video = `<iframe width='560' height='315' src='${ytSrc}' frameborder='0' allowfullscreen></iframe>`;
          card.back += video;
        }

        const soundCloudUrl = this.getSoundCloudURL(card.back);
        if (soundCloudUrl) {
          const audio = `<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=${soundCloudUrl}'></iframe>`;
          card.back += audio;
        }

        if (this.settings.useInput && card.back.includes('<strong>')) {
          const inputInfo = this.treatBoldAsInput(card.back, true);
          card.back = inputInfo.mangle;
        }

        if (!card.tags) {
          card.tags = [];
        }
        if (this.settings.useTags) {
          card = this.locateTags(card);
        }

        if (this.settings.basicReversed) {
          const note = new Note(card.back, card.name);
          note.tags = card.tags;
          note.media = card.media;
          note.number = counter++;
          addThese.push(note);
        }

        if (this.settings.reversed || card.hasRefreshIcon()) {
          const tmp = card.back;
          card.back = card.name;
          card.name = tmp;
          // Due to backwards compatability, do not increment number here
          card.number = -1;
        }
      }
      deck.cards = Deck.CleanCards(deck.cards.concat(addThese));
    }

    this.payload[0].settings = this.settings;
    exporter.configure(this.payload);
    return exporter.save();
  }

  tryExperimental(ws: Workspace) {
    const fallback = new FallbackParser(this.files);
    const exporter = this.setupExporter(this.payload, ws.location);

    this.payload = fallback.run(this.settings);
    if (
      !this.payload ||
      this.payload.length === 0 ||
      this.totalCardCount() === 0
    ) {
      throw NO_PACKAGE_ERROR;
    }

    this.payload[0].settings = this.settings;
    exporter.configure(this.payload);

    return exporter.save();
  }

  totalCardCount() {
    if (this.payload.length === 0) {
      return 0;
    }
    return this.payload.map((p) => p.cardCount).reduce((a, b) => a + b);
  }

  private loadDOM(contents: string) {
    return cheerio.load(
      this.removeNewlinesInSVGPathAttributeD(
        this.settings.noUnderline
          ? contents.replace(/border-bottom:0.05em solid/g, '')
          : contents
      )
    );
  }

  private extractCoverImage(dom: cheerio.Root) {
    const pageCoverImage = dom('.page-cover-image');
    if (pageCoverImage) {
      return pageCoverImage.attr('src');
    }
    return undefined;
  }

  private extractPageIcon(dom: cheerio.Root) {
    const pageIcon = dom('.page-header-icon > .icon');
    return pageIcon.html();
  }

  private extractName(
    name: string,
    pi: string | null,
    decksCount: number
  ): string {
    if (!pi) {
      return name;
    }
    if (this.settings.pageEmoji === 'disable_emoji') {
      return name;
    }

    if (!name.includes(pi) && decksCount === 0) {
      if (!name.includes('::') && !name.startsWith(pi)) {
        return this.settings.pageEmoji === 'first_emoji'
          ? `${pi} ${name}`
          : `${name} ${pi}`;
      } else {
        const names = name.split(/::/);
        const end = names.length - 1;
        const last = names[end];
        names[end] =
          this.settings.pageEmoji === 'first_emoji'
            ? `${pi} ${last}`
            : `${last} ${pi}`;
        return names.join('::');
      }
    }

    return name;
  }

  private extractToggleLists(dom: cheerio.Root) {
    const foundToggleLists = findNotionToggleLists(dom, {
      isCherry: this.settings.isCherry,
      isAll: this.settings.isAll,
      disableIndentedBulletPoints: this.settings.disableIndentedBulletPoints,
    });

    const details = dom('details').toArray();

    /**
     * The document has toggles but they are not in the Notion format.
     */
    const convertedToggleLists =
      foundToggleLists.length === 0 && details.length > 0
        ? transformDetailsTagToNotionToggleList(dom, details)
        : [];

    return [
      ...foundToggleLists,
      ...convertedToggleLists,
      ...this.findIndentedToggleLists(dom),
    ];
  }

  private extractCards(dom: cheerio.Root, toggleList: cheerio.Element[]) {
    let cards: Note[] = [];
    const pageId = dom('article').attr('id');

    toggleList.forEach((t) => {
      // We want to perserve the parent's style, so getting the class
      const p = dom(t);
      const parentUL = p;
      const parentClass = p.attr('class') || '';

      this.checkLimits(cards.length, []);

      if (this.settings.toggleMode === 'open_toggle') {
        dom('details').attr('open', '');
      } else if (this.settings.toggleMode === 'close_toggle') {
        dom('details').removeAttr('open');
      }

      if (parentUL) {
        dom('details').addClass(parentClass);
        dom('summary').addClass(parentClass);
        const summary = parentUL.find('summary').first();
        let toggle = parentUL.find('details').first();

        if (!toggle?.html()) {
          toggle = parentUL.find('.indented');
        }

        if (summary && summary.text()) {
          const validSummary = (() =>
            preserveNewlinesIfApplicable(
              summary.html() || '',
              this.settings
            ))();
          const front = parentClass
            ? `<div class='${parentClass}'>${validSummary}</div>`
            : validSummary;
          if (toggle || this.settings.maxOne) {
            const toggleHTML = toggle.html();
            if (toggleHTML) {
              let b = toggleHTML.replace(summary.html() || '', '');
              if (this.settings.isTextOnlyBack) {
                const paragraphs = dom(toggle).find('> p').toArray();
                b = '';
                for (const paragraph of paragraphs) {
                  if (paragraph) {
                    b += dom(paragraph).html();
                  }
                }
              }

              const backSide = (() => {
                let mangleBackSide = b;
                if (this.settings.maxOne) {
                  mangleBackSide = this.removeNestedToggles(b);
                }
                if (this.settings.perserveNewLines) {
                  mangleBackSide = replaceAll(mangleBackSide, '\n', '<br />');
                }
                return mangleBackSide;
              })();
              const note = new Note(front || '', backSide);
              note.notionId = parentUL.attr('id');
              if (note.notionId && this.settings.addNotionLink) {
                const link = this.getLink(pageId, note);
                if (link !== null) {
                  note.back += link;
                }
              }
              if (
                (this.settings.isAvocado && this.noteHasAvocado(note)) ||
                (this.settings.isCherry && !this.noteHasCherry(note))
              ) {
                console.debug('dropping due to matching rules');
              } else {
                cards.push(note);
              }
            }
          }
        }
      }
    });
    return cards;
  }

  private extractCardsFromParagraph(dom: cheerio.Root) {
    const paragraphs = dom('p').toArray();
    return paragraphs.map((p) => new Note(dom(p).html() ?? '', ''));
  }

  private extractCardsFromLists(
    dom: cheerio.Root,
    disableIndentedBullets: boolean
  ) {
    const cards: Note[] = [];
    const lists = !disableIndentedBullets
      ? [...dom('ul').toArray(), ...dom('ol').toArray()]
      : [...dom('.page-body > .bulleted-list').toArray()];

    lists.forEach((list) => {
      if (!disableIndentedBullets) {
        for (const child of dom(list).find('li')) {
          this.checkLimits(cards.length, []);
          cards.push(new Note(dom(child).html() ?? '', ''));
        }
      } else {
        this.checkLimits(cards.length, []);
        cards.push(new Note(dom(list).html() ?? '', ''));
      }
    });

    return cards;
  }

  private checkLimits(cards: number, decks: Deck[]) {
    checkFlashcardsLimits({
      cards: cards,
      decks: decks,
      paying: this.noLimits,
    });
  }
}
