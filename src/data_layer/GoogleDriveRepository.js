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
exports.GoogleDriveRepository = void 0;
class GoogleDriveRepository {
    constructor(database) {
        this.database = database;
    }
    generateFileData(file, owner) {
        return {
            id: file.id,
            description: file.description,
            embedUrl: file.embedUrl,
            iconUrl: file.iconUrl,
            lastEditedUtc: file.lastEditedUtc,
            mimeType: file.mimeType,
            name: file.name,
            organizationDisplayName: '', // Assuming default value
            parentId: '', // Assuming default value
            serviceId: file.serviceId,
            sizeBytes: file.sizeBytes,
            type: file.type,
            url: file.url,
            owner: owner,
        };
    }
    saveFiles(files, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of files) {
                const fileData = this.generateFileData(file, owner);
                try {
                    yield this.database('google_drive_uploads').insert(fileData);
                }
                catch (error) {
                    if (!(error instanceof Error) || error.code !== '23505')
                        throw error;
                    const existingFile = yield this.database('google_drive_uploads')
                        .where({ id: file.id, owner: owner })
                        .first();
                    if (!existingFile)
                        throw error;
                    yield this.database('google_drive_uploads')
                        .where({ id: file.id, owner: owner })
                        .update(fileData);
                }
            }
        });
    }
}
exports.GoogleDriveRepository = GoogleDriveRepository;
//# sourceMappingURL=GoogleDriveRepository.js.map