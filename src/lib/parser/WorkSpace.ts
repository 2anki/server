import path from 'path';
import fs from 'fs';
import { getRandomUUID } from '../../shared/helpers/getRandomUUID';

class Workspace {
  location: string;

  id: string;

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
    if (!fs.existsSync(this.location)) {
      fs.mkdirSync(this.location, { recursive: true });
    }
  }

  public getFirstAPKG(): Promise<Buffer | null> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.location, (err, files) => {
        const apkg = files.find((file) => file.endsWith('.apkg'));
        if (apkg) {
          resolve(fs.readFileSync(path.join(this.location, apkg)));
        } else {
          reject(null);
        }
      });
    });
  }
}

export default Workspace;
