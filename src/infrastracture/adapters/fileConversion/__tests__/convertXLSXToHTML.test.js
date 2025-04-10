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
const fs_1 = require("fs");
const WorkSpace_1 = __importDefault(require("../../../../lib/parser/WorkSpace"));
const convertXLSXToHTML_1 = require("../convertXLSXToHTML");
const path_1 = require("path");
describe('convertXLSXToHTML', () => {
    beforeAll(() => {
        process.env.WORKSPACE_BASE = '/tmp';
    });
    it('should convert XLSX to HTML and save the file', () => __awaiter(void 0, void 0, void 0, function* () {
        const workspace = new WorkSpace_1.default(true, 'fs');
        const xlsxPath = (0, path_1.join)(__dirname, '../___mock/sim.xlsx');
        const buffer = (0, fs_1.readFileSync)(xlsxPath);
        const html = (0, convertXLSXToHTML_1.convertXLSXToHTML)(buffer, (0, path_1.join)(workspace.location, 'Simple.html'));
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('Simple.html');
    }));
    afterAll(() => {
        delete process.env.WORKSPACE_BASE;
    });
});
//# sourceMappingURL=convertXLSXToHTML.test.js.map