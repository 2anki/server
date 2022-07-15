import cheerio from 'cheerio';

import CustomExporter from './CustomExporter';
import Settings from './Settings';
import Note from './Note';
import Deck from './Deck';
import { File } from '../anki/zip';
import Workspace from './WorkSpace';
import { SuffixFrom } from '../misc/file';
import replaceAll from './helpers/replaceAll';
import handleClozeDeletions from './helpers/handleClozeDeletions';
import sanitizeTags from '../anki/sanitizeTags';
import preserveNewlinesIfApplicable from '../notion/helpers/preserveNewlinesIfApplicable';

import getYouTubeID from './helpers/getYouTubeID';
import getYouTubeEmbedLink from './helpers/getYouTubeEmbedLink';
import getUniqueFileName from '../misc/getUniqueFileName';
import { captureException } from '@sentry/node';

export class DeckParser {
  globalTags: cheerio.Cheerio | null;

  firstDeckName: string;

  settings: Settings;

  payload: Deck[];

  files: File[];

  public get name() {
    return this.payload[0].name;
  }

  constructor(name: string, settings: Settings, files: File[]) {
    this.settings = settings;
    this.files = files || [];
    this.firstDeckName = name;
    this.globalTags = null;
    const firstFile = this.files.find((file) => {
      try {
        return file.name === global.decodeURIComponent(name);
      } catch (error) {
        captureException(error);
        return file.name === name;
      }
    });
    if (firstFile) {
      this.payload = this.handleHTML(
        name,
        firstFile.contents.toString(),
        this.settings.deckName || '',
        []
      );
    } else {
      throw new Error(`Error Unknown file ${name}`);
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
    return nextFile ? nextFile.contents : undefined;
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

  findToggleLists(dom: cheerio.Root) {
    const selector =
      this.settings.isCherry || this.settings.isAll
        ? '.toggle'
        : '.page-body > ul';
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

  setFontSize(style: string) {
    let { fontSize } = this.settings;
    if (fontSize && fontSize !== '20px') {
      // For backwards compatability, don't touch the font-size if it's 20px
      fontSize = fontSize.trim().endsWith('px') ? fontSize : `${fontSize}px`;
      style += '\n' + `* { font-size:${fontSize}}`;
    }
    return style;
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
      captureException(error);
      return null;
    }
  }

  handleHTML(
    fileName: string,
    contents: string,
    deckName: string,
    decks: Deck[]
  ) {
    const dom = cheerio.load(
      this.settings.noUnderline
        ? contents.replace(/border-bottom:0.05em solid/g, '')
        : contents
    );
    /* @ts-ignore */
    let name = deckName || dom('title').text();
    let style = dom('style').html();
    const pageId = dom('article').attr('id');
    if (style) {
      style = style.replace(/white-space: pre-wrap;/g, '');
      style = this.setFontSize(style);
    }

    let image: string | undefined = '';
    const pageCoverImage = dom('.page-cover-image');
    if (pageCoverImage) {
      image = pageCoverImage.attr('src');
    }

    const pageIcon = dom('.page-header-icon > .icon');
    const pi = pageIcon.html();
    if (pi && this.settings.pageEmoji !== 'disable_emoji') {
      if (!name.includes(pi) && decks.length === 0) {
        if (!name.includes('::') && !name.startsWith(pi)) {
          name =
            this.settings.pageEmoji === 'first_emoji'
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
          name = names.join('::');
        }
      }
    }

    this.globalTags = dom('.page-body > p > del');
    const toggleList = this.findToggleLists(dom);
    let cards: Note[] = [];

    toggleList.forEach((t) => {
      // We want to perserve the parent's style, so getting the class
      const p = dom(t);
      const parentUL = p;
      const parentClass = p.attr('class') || '';

      if (this.settings.toggleMode === 'open_toggle') {
        dom('details').attr('open', '');
      } else if (this.settings.toggleMode === 'close_toggle') {
        dom('details').removeAttr('open');
      }

      if (parentUL) {
        dom('details').addClass(parentClass);
        dom('summary').addClass(parentClass);
        const summary = parentUL.find('summary').first();
        const toggle = parentUL.find('details').first();

        if (summary && summary.text()) {
          const validSummary = (() =>
            preserveNewlinesIfApplicable(
              summary.html() || '',
              this.settings
            ))();
          const front = parentClass
            ? `<div class='${parentClass}'>${validSummary}</div>`
            : validSummary;
          /* @ts-ignore */
          if (toggle || (this.settings.maxOne && toggle.text())) {
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

    //  Prevent bad cards from leaking out
    cards = cards.filter(Boolean);
    cards = this.sanityCheck(cards);

    decks.push(
      new Deck(name, cards, image, style, Deck.GenerateId(), this.settings)
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

  hasClozeDeletions(input: string) {
    if (!input) {
      return false;
    }
    return input.includes('code');
  }

  validInputCard(input: Note) {
    if (!this.settings.useInput) {
      return false;
    }
    return input.name && input.name.includes('strong');
  }

  sanityCheck(cards: Note[]) {
    return cards.filter(
      (c) =>
        c.name &&
        (this.hasClozeDeletions(c.name) || c.back || this.validInputCard(c))
    );
  }

  setupExporter(decks: Deck[], workspace: string) {
    for (const d of decks) {
      d.style = d.cleanStyle();
    }
    /* @ts-ignore */
    return new CustomExporter(this.firstDeckName, workspace);
  }

  embedFile(
    exporter: CustomExporter,
    files: File[],
    filePath: string
  ): string | null {
    const suffix = SuffixFrom(filePath);
    let file = files.find((f) => f.name === filePath);
    if (!file) {
      const lookup = `${exporter.firstDeckName}/${filePath}`.replace(
        /\.\.\//g,
        ''
      );
      file = files.find((f) => {
        if (f.name === lookup || f.name.endsWith(filePath)) {
          return f;
        }
      });
      if (!file) {
        console.warn(
          `Missing relative path to ${filePath} used ${exporter.firstDeckName}`
        );
        return null;
      }
    }
    const newName = getUniqueFileName(filePath) + suffix;
    const contents = file.contents as string;
    if (contents) {
      exporter.addMedia(newName, contents);
    }
    return newName;
  }

  // https://stackoverflow.com/questions/6903823/regex-for-youtube-id
  _getYouTubeID(input: string) {
    return this.ensureNotNull(input, () => {
      try {
        return getYouTubeID(input);
      } catch (error) {
        console.debug('error in getYouTubeID');
        captureException(error);
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
        captureException(error);
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
        if (!ma.endsWith('.mp3') || ma.startsWith('http')) {
          return null;
        }
        return ma;
      } catch (error) {
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

  async build() {
    const ws = new Workspace(true, 'fs');
    const exporter = this.setupExporter(this.payload, ws.location);

    for (const d of this.payload) {
      const deck = d;
      deck.id = Deck.GenerateId();
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
        if (card.back) {
          const dom = cheerio.load(card.back);
          const images = dom('img');
          const decodeURIComponent = global.decodeURIComponent;
          if (images.length > 0) {
            images.each((_i, elem) => {
              const originalName = dom(elem).attr('src');
              if (originalName && !originalName.startsWith('http')) {
                const newName = this.embedFile(
                  exporter,
                  this.files,
                  decodeURIComponent(originalName)
                );
                if (newName) {
                  dom(elem).attr('src', newName);
                  card.media.push(newName);
                }
              }
            });
            card.back = dom.html();
          }

          const audiofile = this.getMP3File(card.back);
          if (audiofile) {
            if (this.settings.removeMP3Links) {
              card.back = card.back.replace(
                /<figure.*<a\shref=["'].*\.mp3["']>.*<\/a>.*<\/figure>/,
                ''
              );
            }
            const newFileName = this.embedFile(
              exporter,
              this.files,
              global.decodeURIComponent(audiofile)
            );
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
      deck.cards = deck.cards.concat(addThese);
    }

    this.payload[0].settings = this.settings;
    exporter.configure(this.payload);
    return exporter.save();
  }
}

export async function PrepareDeck(
  fileName: string,
  files: File[],
  settings: Settings
) {
  const parser = new DeckParser(fileName, settings, files);
  const total = parser.payload.map((p) => p.cardCount).reduce((a, b) => a + b);
  if (total === 0) {
    return null;
  }

  const apkg = await parser.build();
  return { name: `${parser.name}.apkg`, apkg, deck: parser.payload };
}
