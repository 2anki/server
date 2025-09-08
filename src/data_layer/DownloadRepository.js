"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DownloadRepository {
    constructor(database) {
        this.database = database;
        this.table = 'uploads';
    }
    getFile(owner, key) {
        const query = { key, owner };
        return this.database(this.table).where(query).returning(['key']).first();
    }
    deleteMissingFile(owner, key) {
        console.warn(`Deleting missing file ${key} for ${owner}`);
        return this.database.table('uploads').where({ owner, key }).delete();
    }
}
exports.default = DownloadRepository;
//# sourceMappingURL=DownloadRepository.js.map