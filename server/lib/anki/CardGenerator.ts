import { execFile } from 'child_process';
import { homedir } from 'os';
import path from 'path';

import { resolvePath } from '../constants';

function PYTHON() {
  const os = process.platform;
  if (os === 'win32') {
    return `${homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe`;
  }
  return '/usr/bin/python3';
}

class CardGenerator {
  createDeckScriptPath: string;

  currentDirectory: string;

  constructor(workspace: string) {
    this.createDeckScriptPath = resolvePath(
      __dirname,
      '../../genanki/create_deck.py',
    );
    this.currentDirectory = workspace;
  }

  async run() {
    const dpayload = path.join(this.currentDirectory, 'deck_info.json');
    const tdir = resolvePath(__dirname, '../../templates/');

    const createDeckScriptPathARGS = [
      this.createDeckScriptPath,
      dpayload,
      tdir,
    ];
    return new Promise((resolve, reject) => {
      execFile(
        PYTHON(),
        createDeckScriptPathARGS,
        { cwd: this.currentDirectory },
        (err, stdout) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(stdout);
          }
        },
      );
    });
  }
}

export default CardGenerator;
