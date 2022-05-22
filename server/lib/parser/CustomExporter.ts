import path from 'path';
import fs from 'fs';

import CardGenerator from '../anki/CardGenerator';
import Deck from './Deck';

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
    const payloadInfo = path.join(this.workspace, 'deck_info.json');
    fs.writeFileSync(payloadInfo, JSON.stringify(payload, null, 2));
  }

  async save() {
    const gen = new CardGenerator(this.workspace);
    const payload = (await gen.run()) as string;
    return fs.readFileSync(payload);
  }
}

export default CustomExporter;
