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
exports.listFiles = listFiles;
const fs_1 = __importDefault(require("fs"));
function listFiles(workspace) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = [];
        function explorePath(currentPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const dir = yield fs_1.default.promises.readdir(currentPath);
                for (const fileName of dir) {
                    const filePath = `${currentPath}/${fileName}`;
                    const stats = yield fs_1.default.promises.stat(filePath);
                    if (stats.isFile()) {
                        const buffer = yield fs_1.default.promises.readFile(filePath);
                        files.push({
                            name: filePath,
                            contents: new Uint8Array(buffer),
                        });
                    }
                    else if (stats.isDirectory()) {
                        yield explorePath(filePath); // Recursively explore subdirectories
                    }
                }
            });
        }
        yield explorePath(workspace);
        return files;
    });
}
//# sourceMappingURL=listFiles.js.map