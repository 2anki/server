"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const CardGenerator_1 = __importDefault(require("../../anki/CardGenerator"));
class CustomExporter {
    constructor(firstDeckName, workspace) {
        this.firstDeckName = firstDeckName.replace('.html', '');
        this.workspace = workspace;
        this.media = [];
    }
    addMedia(newName, contents) {
        console.debug(`Adding media: ${newName}`);
        const abs = path_1.default.join(this.workspace, newName);
        this.media.push(abs);
        fs_1.default.writeFileSync(abs, contents);
        return abs;
    }
    configure(payload) {
        fs_1.default.writeFileSync(this.getPayloadInfoPath(), JSON.stringify(payload, null, 2));
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const gen = new CardGenerator_1.default(this.workspace);
            if (process.env.SKIP_CREATE_DECK) {
                return fs_1.default.readFileSync(this.getPayloadInfoPath());
            }
            const apkgPath = (yield gen.run());
            return fs_1.default.readFileSync(apkgPath);
        });
    }
    getPayloadInfoPath() {
        return path_1.default.join(this.workspace, 'deck_info.json');
    }
}
exports.default = CustomExporter;
//# sourceMappingURL=CustomExporter.js.map