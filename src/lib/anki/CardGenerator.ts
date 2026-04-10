import { existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { homedir } from 'node:os';
import path from 'node:path';

import { CREATE_DECK_DIR, CREATE_DECK_SCRIPT_PATH, resolvePath } from '../constants';

function tryCommand(command: string): boolean {
  try {
    execFileSync(command, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function findExisting(paths: string[]): string | undefined {
  return paths.find((p) => existsSync(p));
}

function findExecutable(commands: string[]): string | undefined {
  return commands.find((c) => tryCommand(c));
}

function windowsPython(): string | undefined {
  const localPython = path.join(homedir(), 'AppData', 'Local', 'Programs', 'Python', 'Python38', 'python.exe');
  return findExisting([localPython]) ?? findExecutable(['py', 'python', 'python3']);
}

function macPython(): string | undefined {
  return findExisting([
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python3',
  ]);
}

function PYTHON(): string {
  const envOverride = process.env.PYTHON || process.env.ANKI_PYTHON;
  if (envOverride) {
    return envOverride;
  }

  const venvPython = path.join(CREATE_DECK_DIR, 'venv', 'bin', 'python3');
  if (existsSync(venvPython)) {
    return venvPython;
  }

  const platformPythonLookups: Record<string, () => string | undefined> = {
    win32: windowsPython,
    darwin: macPython,
  };

  const platformPython = platformPythonLookups[process.platform]?.();

  return platformPython ?? findExisting(['/usr/bin/python3']) ?? 'python3';
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
    console.log('execFile', path.basename(PYTHON()), createDeckScriptPathARGS.length, 'args');
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
