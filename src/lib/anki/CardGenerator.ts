import { spawn } from 'child_process';
import { homedir } from 'os';
import path from 'path';

import { CREATE_DECK_SCRIPT_PATH, resolvePath } from '../constants';

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

  run() {
    const deckInfo = path.join(this.currentDirectory, 'deck_info.json');
    const templateDirectory = resolvePath(__dirname, '../../templates/');

    const createDeckScriptPathARGS = [
      CREATE_DECK_SCRIPT_PATH,
      deckInfo,
      templateDirectory,
    ];
    console.log('execFile', PYTHON(), createDeckScriptPathARGS);
    return new Promise((resolve, reject) => {
      const process = spawn(PYTHON(), createDeckScriptPathARGS, {
        cwd: this.currentDirectory,
      });

      process.on('error', (err) => {
        console.info('Create deck failed');
        console.error(err);
        reject(err);
      });

      const stdoutData: string[] = [];
      process.stdout.on('data', (data) => {
        stdoutData.push(data.toString());
      });

      const stderrData: string[] = [];
      process.stderr.on('data', (data) => {
        stderrData.push(data.toString());
      });

      process.on('close', (code) => {
        if (code !== 0) {
          const errorOutput = stderrData.join('').trim();
          return reject(
            new Error(`Python script exited with code ${code}: ${errorOutput}`)
          );
        }
        const lastLine = stdoutData.join('').trim().split('\n').pop();
        resolve(lastLine);
      });
    });
  }
}

export default CardGenerator;
