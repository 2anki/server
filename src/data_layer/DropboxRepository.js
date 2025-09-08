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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropboxRepository = void 0;
class DropboxRepository {
    constructor(database) {
        this.database = database;
    }
    saveFiles(files, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database('dropbox_uploads').insert(files.map((file) => ({
                owner,
                bytes: file.bytes,
                icon: file.icon,
                dropbox_id: file.id,
                isDir: file.isDir,
                link: file.link,
                linkType: file.linkType,
                name: file.name,
            })));
        });
    }
}
exports.DropboxRepository = DropboxRepository;
//# sourceMappingURL=DropboxRepository.js.map