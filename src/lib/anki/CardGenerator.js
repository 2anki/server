"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const constants_1 = require("../constants");
function PYTHON() {
    const os = process.platform;
    if (os === 'win32') {
        return `${os_1.homedir}\\AppData\\Local\\Programs\\Python\\Python38\\python.exe`;
    }
    return '/usr/bin/python3';
}
class CardGenerator {
    constructor(workspace) {
        this.currentDirectory = workspace;
    }
    run() {
        const deckInfo = path_1.default.join(this.currentDirectory, 'deck_info.json');
        const templateDirectory = (0, constants_1.resolvePath)(__dirname, '../../templates/');
        const createDeckScriptPathARGS = [
            constants_1.CREATE_DECK_SCRIPT_PATH,
            deckInfo,
            templateDirectory,
        ];
        console.log('execFile', PYTHON(), createDeckScriptPathARGS);
        return new Promise((resolve, reject) => {
            const process = (0, child_process_1.spawn)(PYTHON(), createDeckScriptPathARGS, {
                cwd: this.currentDirectory,
            });
            process.on('error', (err) => {
                console.info('Create deck failed');
                console.error(err);
                reject(err);
            });
            const stdoutData = [];
            process.stdout.on('data', (data) => {
                stdoutData.push(data.toString());
            });
            const stderrData = [];
            process.stderr.on('data', (data) => {
                stderrData.push(data.toString());
            });
            process.on('close', (code) => {
                if (code !== 0) {
                    const errorOutput = stderrData.join('').trim();
                    return reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
                }
                const lastLine = stdoutData.join('').trim().split('\n').pop();
                resolve(lastLine);
            });
        });
    }
}
exports.default = CardGenerator;
//# sourceMappingURL=CardGenerator.js.map