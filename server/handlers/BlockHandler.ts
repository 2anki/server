import { Block } from "@notionhq/client/build/src/api-types";
import NotionAPIWrapper from "../notion/api";
import Note from "../parser/Note";
import Settings from "../parser/Settings";

class BlockHandler {
  togglelLists: Block[];
  api: NotionAPIWrapper;

  constructor(api: NotionAPIWrapper, togglelLists: Block[]) {
    this.togglelLists = togglelLists;
    this.api = api;
  }

  async getBackSide(block: Block) {
    const requestChildren = await this.api.notion.blocks.children.list({
      block_id: block.id,
    });

    const children = requestChildren.results;
    return (
      children
        // @ts-ignore
        .map((c) => c.paragraph.text[0].text.content)
        .toString()
    );
  }

  async getFlashcards(settings: Settings): Promise<Note[]> {
    let cards = [];

    for (const block of this.togglelLists) {
      if (block.has_children) {
        if (settings.isCloze) {
          const clozeCard = await this.getClozeDeletionCard(block);
          if (clozeCard) {
            cards.push(clozeCard);
            continue;
          }
        }

        // If it's a basic card then check for children
        /* @ts-ignore */
        const name = block.toggle.text[0].text.content;
        const back = await this.getBackSide(block);
        let note = new Note(name, back);
        cards.push(note);
      } else if (settings.isCloze) {
        const card = await this.getClozeDeletionCard(block);
        if (card) {
          cards.push(card);
        }
      }
    }

    return cards;
  }

  // The user wants to turn code blocks into cloze deletions <code>word</code> becomes {{c1::word}}
  async getClozeDeletionCard(block: Block): Promise<Note | undefined> {
    let isCloze = false;
    let name = "";
    // @ts-ignore
    for (const cb of block.toggle.text) {
      if (cb.annotations.code) {
        name += `{{c1::${cb.text.content}}}`;
        isCloze = true;
      } else {
        name += cb.text.content;
      }
    }
    if (isCloze) {
      const back = await this.getBackSide(block);
      let note = new Note(name, back);
      note.cloze = isCloze;
      return note;
    }
    return undefined;
  }
}

export default BlockHandler;
