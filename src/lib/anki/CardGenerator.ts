import { execFile } from 'child_process';
import { homedir } from 'os';
import path from 'path';

import { CREATE_DECK_SCRIPT_PATH, resolvePath } from '../constants';
import { sendError } from '../error/sendError';

function PYTHON() {
  const os = process.platform;
  if (os === 'win32') {
    return `${homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe`;
  }
  return '/usr/bin/python3';
}

class CardGenerator {
  currentDirectory: string;

  constructor(workspace: string) {
    this.currentDirectory = workspace;
  }

  async run() {
    const dpayload = path.join(this.currentDirectory, 'deck_info.json');
    const tdir = resolvePath(__dirname, '../../templates/');

    const createDeckScriptPathARGS = [CREATE_DECK_SCRIPT_PATH, dpayload, tdir];
    console.log('execFile', PYTHON(), createDeckScriptPathARGS);
    return new Promise((resolve, reject) => {
      execFile(
        PYTHON(),
        createDeckScriptPathARGS,
        { cwd: this.currentDirectory },
        (err, stdout) => {
          if (err) {
            sendError(err);
            reject(err);
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }
}

export default CardGenerator;
