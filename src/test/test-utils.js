"use strict";
// This file is temporarily to reduce duplication between jest and ava.
// When jest migration is complete it can be deleted most likely
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
exports.pageId = void 0;
exports.getDeck = getDeck;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DeckParser_1 = require("../lib/parser/DeckParser");
const WorkSpace_1 = __importDefault(require("../lib/parser/WorkSpace"));
function mockPayload(name, contents) {
    return [{ name, contents }];
}
function loadFixture(fileName) {
    const filePath = path_1.default.join(__dirname, 'fixtures', fileName);
    const html = fs_1.default.readFileSync(filePath).toString();
    return mockPayload(fileName, html);
}
function configureParser(fileName, opts) {
    const info = loadFixture(fileName);
    return new DeckParser_1.DeckParser({
        name: fileName,
        settings: opts,
        files: info,
        noLimits: true,
        workspace: new WorkSpace_1.default(true, 'fs'),
    });
}
function getDeck(fileName, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const p = configureParser(fileName, opts);
        yield p.build(new WorkSpace_1.default(true, 'fs'));
        return p.payload[0];
    });
}
exports.pageId = '3ce6b147ac8a425f836b51cc21825b85';
//# sourceMappingURL=test-utils.js.map