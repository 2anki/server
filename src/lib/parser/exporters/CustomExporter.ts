import path from 'path';
import fs, { PathLike } from 'fs';

import CardGenerator from '../../anki/CardGenerator';
import Deck from '../Deck';
import { NO_PACKAGE_ERROR } from '../../error/constants';

class CustomExporter {
  firstDeckName: string;

  workspace: string;

  media: string[];

  constructor(firstDeckName: string, workspace: string) {
    this.firstDeckName = firstDeckName.replace('.html', '');
    this.workspace = workspace;
    this.media = [];
  }

  addMedia(newName: string, contents: string) {
    console.debug(`Adding media: ${newName}`);
    const abs = path.join(this.workspace, newName);
    this.media.push(abs);
    fs.writeFileSync(abs, contents);
    return abs;
  }

  configure(payload: Deck[]) {
    const hasCards = payload.some((p) => p.cardCount > 0);
    if (!hasCards) {
      throw NO_PACKAGE_ERROR;
    }

    fs.writeFileSync(
      this.getPayloadInfoPath(),
      JSON.stringify(payload, null, 2)
    );
  }

  async save(): Promise<Buffer> {
    const gen = new CardGenerator(this.workspace);
    if (process.env.SKIP_CREATE_DECK) {
      return fs.readFileSync(this.getPayloadInfoPath());
    }
    const apkgPath = (await gen.run()) as string;
    return fs.readFileSync(apkgPath);
  }

  getPayloadInfoPath(): PathLike {
    return path.join(this.workspace, 'deck_info.json');
  }
}

export default CustomExporter;
