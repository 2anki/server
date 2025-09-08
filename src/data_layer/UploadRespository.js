"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UploadRepository {
    constructor(database) {
        this.database = database;
        this.table = 'uploads';
    }
    deleteUpload(owner, key) {
        return this.database(this.table).del().where({ owner, key });
    }
    getUploadsByOwner(owner) {
        return this.database(this.table)
            .where({ owner: owner })
            .orderBy('id', 'desc')
            .returning('*');
    }
    update(owner, filename, key, size_mb) {
        return this.database(this.table).insert({
            owner,
            filename,
            key,
            size_mb,
        });
    }
}
exports.default = UploadRepository;
//# sourceMappingURL=UploadRespository.js.map