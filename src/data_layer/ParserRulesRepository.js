"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParserRulesRepository {
    constructor(database) {
        this.database = database;
        this.tableName = 'parser_rules';
        this.database = database;
    }
    create(id, owner, input) {
        return this.database(this.tableName)
            .insert({
            owner,
            object_id: id,
            flashcard_is: input.FLASHCARD,
            deck_is: input.DECK,
            sub_deck_is: input.SUB_DECKS,
            tags_is: input.TAGS,
            email_notification: input.EMAIL_NOTIFICATION,
        })
            .onConflict('object_id')
            .merge();
    }
    getById(id) {
        return this.database(this.tableName)
            .where({ object_id: id })
            .returning('*')
            .first();
    }
}
exports.default = ParserRulesRepository;
//# sourceMappingURL=ParserRulesRepository.js.map