"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TemplatesRepository {
    constructor(database) {
        this.database = database;
        this.table = 'templates';
    }
    create({ owner, payload }) {
        return this.database(this.table)
            .insert({
            owner: owner,
            payload: JSON.stringify(payload),
        })
            .onConflict('owner')
            .merge();
    }
    delete(owner) {
        return this.database(this.table).del().where({ owner });
    }
}
exports.default = TemplatesRepository;
//# sourceMappingURL=TemplatesRepository.js.map