"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SettingsRepository {
    constructor(database) {
        this.database = database;
        this.table = 'settings';
    }
    create({ owner, object_id, payload }) {
        return this.database(this.table)
            .insert({
            owner,
            object_id,
            payload,
        })
            .onConflict('object_id')
            .merge();
    }
    delete(owner, object_id) {
        return this.database(this.table).del().where({ owner, object_id });
    }
    getById(object_id) {
        return this.database(this.table)
            .where({ object_id })
            .returning(['payload'])
            .first();
    }
}
exports.default = SettingsRepository;
//# sourceMappingURL=SettingsRepository.js.map