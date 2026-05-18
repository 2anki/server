import path from 'path';
import fs from 'fs';
import fsp from 'node:fs/promises';
import { getRandomUUID } from '../../shared/helpers/getRandomUUID';

class Workspace {
  location: string;

  id: string;

  static subdir(parentLocation: string): Workspace {
    const ws = Object.create(Workspace.prototype) as Workspace;
    ws.id = getRandomUUID();
    ws.location = path.join(parentLocation, ws.id);
    fs.mkdirSync(ws.location, { recursive: true });
    return ws;
  }

  constructor(isNew: boolean, type: string) {
    if (isNew && type === 'fs') {
      this.id = getRandomUUID();
      this.location = path.join(process.env.WORKSPACE_BASE!, this.id);
    } else {
      throw new Error(`unsupported ${type}`);
    }
    this.ensureExists();
  }

  private ensureExists() {
    console.log('Ensuring workspace exists', this.location);
    if (!fs.existsSync(this.location)) {
      fs.mkdirSync(this.location, { recursive: true });
    }
  }

  public async getFirstAPKG(): Promise<Buffer | null> {
    const files = await fsp.readdir(this.location);
    const apkg = files.find((file) => file.endsWith('.apkg'));
    if (!apkg) {
      console.log('No APKG file found', this.location);
      throw new Error('No APKG file found');
    }
    return fsp.readFile(path.join(this.location, apkg));
  }
}

export default Workspace;
