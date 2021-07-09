import crypto from "crypto";
import path from "path";
import fs from "fs";

import { nanoid, customAlphabet } from "nanoid";
import cheerio from "cheerio";

import CustomExporter from "./CustomExporter";
import Settings from "./Settings";
import Note from "./Note";
import Deck from "./Deck";
import { File } from "../handlers/zip";

const replaceAll = (original: string, oldValue: string, newValue: string) => {
  // escaping all special Characters
  const escaped = oldValue.replace(/[{}()[\].?*+$^\\/]/g, "\\$&");
  // creating regex with global flag
  const reg = new RegExp(escaped, "g");
  return original.replace(reg, newValue);
};

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
    const file = this.files.find((file) => {
      try {
        return file.name === global.decodeURIComponent(name);
      } catch (error) {
        console.error(error);
        return file.name === name;
      }
    });
    if (file) {
      this.payload = this.handleHTML(
        name,
        file.contents.toString(),
        this.settings.deckName || "",
        []
      );
    } else {
      throw new Error(`Error Unknown file ${name}`);
    }
  }

  findNextPage(
    href: string | undefined,
    fileName: string
  ): string | Uint8Array | undefined {
    if (!href) {
      console.log("skipping next page, due to href being", href);
      return undefined;
    }
    const next = global.decodeURIComponent(href);
    const file = this.files.find((file) => {
      return file.name.match(next);
    });
    if (!file) {
      return file;
    }
    return file.contents;
  }

  noteHasCherry(note: Note) {
    const cherry = "&#x1F352;";
    return (
      note.name.includes(cherry) ||
      note.back.includes(cherry) ||
      note.name.includes("🍒") ||
      note.back.includes("🍒")
    );
  }

  noteHasAvocado(note: Note) {
    const avocado = "&#x1F951";
    return note.name.includes(avocado) || note.name.includes("🥑");
  }

  noteHasRefreshIcon(name: string) {
    const refreshIcon = "&#x1F504";
    return name.includes(refreshIcon) || name.includes("🔄");
  }

  findToggleLists(dom: cheerio.Root) {
    const selector =
      this.settings.isCherry || this.settings.isAll
        ? ".toggle"
        : ".page-body > ul";
    return dom(selector).toArray();
  }

  removeNestedToggles(input: string) {
    return input
      .replace(/<details(.*?)>(.*?)<\/details>/g, "")
      .replace(/<summary>(.*?)<\/summary>/g, "")
      .replace(/<li><\/li>/g, "")
      .replace(/<ul[^/>][^>]*><\/ul>/g, "")
      .replace(/<\/details><\/li><\/ul><\/details><\/li><\/ul>/g, "")
      .replace(/<\/details><\/li><\/ul>/g, "")
      .replace(/<p[^/>][^>]*><\/p>/g, "");
  }

  setFontSize(style: string) {
    let fontSize = this.settings.fontSize;
    if (fontSize && fontSize !== "20px") {
      // For backwards compatability, don't touch the font-size if it's 20px
      fontSize = fontSize.trim().endsWith("px") ? fontSize : fontSize + "px";
      style += "\n" + "* { font-size:" + fontSize + "}";
    }
    return style;
  }

  getLink(pageId: string | undefined, note: Note): string | null {
    try {
      const page = pageId!.replace(/-/g, "");
      const link = `https://www.notion.so/${page}#${note.notionId}`;
      return `
                <a
                style="text-decoration: none; color: grey;"
                href="${link}">
                  Open in Notion
                </a>
                `;
    } catch (error) {
      console.info("experienced error while getting link");
      console.error(error);
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
        ? contents.replace(/border-bottom:0.05em solid/g, "")
        : contents
    );
    let name = deckName || dom("title").text();
    let style = dom("style").html();
    const pageId = dom("article").attr("id");
    if (style) {
      style = style.replace(/white-space: pre-wrap;/g, "");
      style = this.setFontSize(style);
    }

    let image: string | undefined = "";
    const pageCoverImage = dom(".page-cover-image");
    if (pageCoverImage) {
      image = pageCoverImage.attr("src");
    }

    const pageIcon = dom(".page-header-icon > .icon");
    const pi = pageIcon.html();
    if (pi) {
      if (!name.includes(pi) && decks.length === 0) {
        if (!name.includes("::") && !name.startsWith(pi)) {
          name = `${pi} ${name}`;
        } else {
          const names = name.split(/::/);
          const end = names.length - 1;
          const last = names[end];
          names[end] = `${pi} ${last}`;
          name = names.join("::");
        }
      }
    }

    this.globalTags = dom(".page-body > p > del");
    const toggleList = this.findToggleLists(dom);
    let cards: Note[] = [];

    toggleList.forEach((t) => {
      // We want to perserve the parent's style, so getting the class
      const p = dom(t);
      const parentUL = p;
      const parentClass = p.attr("class") || "";

      if (this.settings.toggleMode === "open_toggle") {
        dom("details").attr("open", "");
      } else if (this.settings.toggleMode === "close_toggle") {
        dom("details").removeAttr("open");
      }

      if (parentUL) {
        dom("details").addClass(parentClass);
        dom("summary").addClass(parentClass);
        const summary = parentUL.find("summary").first();
        const toggle = parentUL.find("details").first();

        if (summary && summary.text()) {
          const validSummary = (() => {
            const s = summary.html() || "";
            if (this.settings.perserveNewLinesInSummary) {
              return replaceAll(s, "\n", "<br />");
            }
            return s;
          })();
          const front = parentClass
            ? `<div class='${parentClass}'>${validSummary}</div>`
            : validSummary;
          if ((summary && toggle) || (this.settings.maxOne && toggle.text())) {
            const toggleHTML = toggle.html();
            if (toggleHTML) {
              let b = toggleHTML.replace(summary.html() || "", "");
              if (this.settings.isTextOnlyBack) {
                const paragraphs = dom(toggle).find("> p").toArray();
                b = "";
                for (const paragraph of paragraphs) {
                  if (paragraph) {
                    b += dom(paragraph).html();
                  }
                }
              }

              const backSide = (() => {
                let _b = b;
                if (this.settings.maxOne) {
                  _b = this.removeNestedToggles(b);
                }
                if (this.settings.perserveNewLinesInSummary) {
                  _b = replaceAll(_b, "\n", "<br />");
                }
                return _b;
              })();
              const note = new Note(front || "", backSide);
              note.notionId = parentUL.attr("id");
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
                console.log("dropping due to matching rules");
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
      new Deck(name, cards, image, style, this.generateId(), this.settings)
    );

    const subpages = dom(".link-to-page").toArray();
    for (const page of subpages) {
      const spDom = dom(page);
      const ref = spDom.find("a").first();
      const href = ref.attr("href");
      const pageContent = this.findNextPage(href, fileName);
      if (pageContent && name) {
        const subDeckName = spDom.find("title").text() || ref.text();
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
    return input.includes("code");
  }

  validInputCard(input: Note) {
    if (!this.settings.useInput) {
      return false;
    }
    return input.name && input.name.includes("strong");
  }

  sanityCheck(cards: Note[]) {
    return cards.filter(
      (c) =>
        c.name &&
        (this.hasClozeDeletions(c.name) || c.back || this.validInputCard(c))
    );
  }

  // Try to avoid name conflicts && invalid characters by hashing
  newUniqueFileName(input: string) {
    const shasum = crypto.createHash("sha1");
    shasum.update(input);
    return shasum.digest("hex");
  }

  suffix(input: string) {
    if (!input) {
      return null;
    }
    const m = input.match(/\.[0-9a-z]+$/i);
    if (!m) {
      return null;
    }
    return m[0];
  }

  setupExporter(deck: Deck, workspace: string) {
    const css = deck.cleanStyle();
    fs.mkdirSync(workspace);
    fs.writeFileSync(path.join(workspace, "deck_style.css"), css);
    return new CustomExporter(this.firstDeckName, workspace);
  }

  embedFile(
    exporter: CustomExporter,
    files: File[],
    filePath: string
  ): string | null {
    const suffix = this.suffix(filePath);
    if (!suffix) {
      return null;
    }
    let file = files.find((f) => f.name === filePath);
    if (!file) {
      const lookup = `${exporter.firstDeckName}/${filePath}`.replace(
        /\.\.\//g,
        ""
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
    const newName = this.newUniqueFileName(filePath) + suffix;
    const contents = file.contents as string;
    if (contents) {
      exporter.addMedia(newName, contents);
    }
    return newName;
  }

  // https://stackoverflow.com/questions/6903823/regex-for-youtube-id
  getYouTubeID(input: string) {
    return this.ensureNotNull(input, () => {
      try {
        const m = input.match(
          /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=|\/sandalsResorts#\w\/\w\/.*\/))([^/&]{10,12})/
        );
        if (!m || m.length === 0) {
          return null;
        }
        // prevent swallowing of soundcloud embeds
        if (m[0].match(/https:\/\/soundcloud.com/)) {
          return null;
        }
        return m[1];
      } catch (error) {
        console.log("error in getYouTubeID");
        console.error(error);
        return null;
      }
    });
  }

  ensureNotNull(input: string, cb: () => void) {
    if (!input || !input.trim()) {
      return null;
    } else {
      return cb();
    }
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
        console.log("error in getSoundCloudURL");
        console.error(error);
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
        if (!ma.endsWith(".mp3") || ma.startsWith("http")) {
          return null;
        }
        return ma;
      } catch (error) {
        return null;
      }
    });
  }

  handleClozeDeletions(input: string) {
    const dom = cheerio.load(input);
    const clozeDeletions = dom("code");
    let mangle = input;
    let num = 1;
    clozeDeletions.each((i, elem) => {
      let v = dom(elem).html();
      if (v) {
        if (v.includes("{{c") && v.includes("}}") && !v.includes("KaTex")) {
          // make Statement unreachable bc. even clozes can get such a formation
          // eg: \frac{{c}} 1 would give that.
          mangle = replaceAll(mangle, `<code>${v}</code>`, v);
        } else if (!v.includes("KaTex") && v.match(/c\d::/)) {
          // In the case user forgets the curly braces, add it for them
          if (!v.includes("{{")) {
            mangle = mangle.replace("<code>", `{{`);
          } else {
            mangle = mangle.replace("<code>", "");
          }
          if (!v.endsWith("}}")) {
            mangle = mangle.replace("</code>", "}}");
          } else {
            mangle = mangle.replace("</code>", "");
          }
        } else if (!v.includes("KaTex")) {
          const old = `<code>${v}</code>`;
          const newValue = v.match(/c\d::/) ? `{{${v}}}` : `{{c${num}::${v}}}`;
          mangle = replaceAll(mangle, old, newValue);
          num += 1;
        } else {
          const old = `<code>${v}</code>`;
          // prevent "}}" so that anki closes the Cloze at the right }} not this one
          const vReplaced = replaceAll(v, "}}", "} }");
          const newValue = "{{c" + num + "::" + vReplaced + "}}";
          mangle = replaceAll(mangle, old, newValue);
          num += 1;
        }
      }
    });

    return mangle;
  }

  treatBoldAsInput(input: string, inline: boolean) {
    const dom = cheerio.load(input);
    const underlines = dom("strong");
    let mangle = input;
    let answer = "";
    underlines.each((i, elem) => {
      const v = dom(elem).html();
      if (v) {
        const old = `<strong>${v}</strong>`;
        mangle = replaceAll(mangle, old, inline ? v : "{{type:Input}}");
        answer = v;
      }
    });
    return { mangle, answer };
  }

  generateId() {
    return parseInt(customAlphabet("1234567890", 16)(), 10);
  }

  locateTags(card: Note) {
    const input = [card.name, card.back];

    for (const i of input) {
      if (!i) {
        continue;
      }

      const dom = cheerio.load(i);
      const deletionsDOM = dom("del");
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
          card.tags.push(
            ...del
              .text()
              .split(",")
              .map(($1) => $1.trim().replace(/\s/g, "-"))
          );
          card.back = replaceAll(card.back, `<del>${del.html()}</del>`, "");
          card.name = replaceAll(card.name, `<del>${del.html()}</del>`, "");
        });
      }
    }
    return card;
  }

  async build() {
    const ws = process.env.WORKSPACE_BASE;
    if (!ws) {
      throw new Error("Undefined workspace");
    }
    const workspace = path.join(ws, nanoid());
    console.log("workspace", workspace);
    const exporter = this.setupExporter(this.payload[0], workspace);

    for (const d of this.payload) {
      const deck = d;
      deck.id = this.generateId();
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
          card.name = this.handleClozeDeletions(card.name);
        }

        if (this.settings.useInput && card.name.includes("<strong>")) {
          const inputInfo = this.treatBoldAsInput(card.name, false);
          card.name = inputInfo.mangle;
          card.answer = inputInfo.answer;
        }

        card.media = [];
        if (card.back) {
          const dom = cheerio.load(card.back);
          const images = dom("img");
          if (images.length > 0) {
            images.each((_i, elem) => {
              const originalName = dom(elem).attr("src");
              if (originalName && !originalName.startsWith("http")) {
                const newName = this.embedFile(
                  exporter,
                  this.files,
                  global.decodeURIComponent(originalName)
                );
                if (newName) {
                  dom(elem).attr("src", newName);
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
                ""
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
          const id = this.getYouTubeID(card.back);
          if (id) {
            const ytSrc = `https://www.youtube.com/embed/${id}?`.replace(
              /"/,
              ""
            );
            const video = `<iframe width='560' height='315' src='${ytSrc}' frameborder='0' allowfullscreen></iframe>`;
            card.back += video;
          }

          const soundCloudUrl = this.getSoundCloudURL(card.back);
          if (soundCloudUrl) {
            const audio = `<iframe width='100%' height='166' scrolling='no' frameborder='no' src='https://w.soundcloud.com/player/?url=${soundCloudUrl}'></iframe>`;
            card.back += audio;
          }

          if (this.settings.useInput && card.back.includes("<strong>")) {
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

        if (this.settings.reversed || this.noteHasRefreshIcon(card.name)) {
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
  const apkg = await parser.build();
  return { name: `${parser.name}.apkg`, apkg, deck: parser.payload };
}
