"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const getRandomUUID_1 = require("../../shared/helpers/getRandomUUID");
class Workspace {
    constructor(isNew, type) {
        if (isNew && type === 'fs') {
            this.id = (0, getRandomUUID_1.getRandomUUID)();
            this.location = path_1.default.join(process.env.WORKSPACE_BASE, this.id);
        }
        else {
            throw new Error(`unsupported ${type}`);
        }
        this.ensureExists();
    }
    ensureExists() {
        console.log('Ensuring workspace exists', this.location);
        if (!fs_1.default.existsSync(this.location)) {
            fs_1.default.mkdirSync(this.location, { recursive: true });
        }
    }
    getFirstAPKG() {
        return new Promise((resolve, reject) => {
            fs_1.default.readdir(this.location, (err, files) => {
                const apkg = files.find((file) => file.endsWith('.apkg'));
                if (apkg) {
                    resolve(fs_1.default.readFileSync(path_1.default.join(this.location, apkg)));
                }
                else {
                    console.log('No APKG file found', this.location);
                    reject(new Error('No APKG file found'));
                }
            });
        });
    }
}
exports.default = Workspace;
//# sourceMappingURL=WorkSpace.js.map