"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParserRulesService {
    constructor(repository) {
        this.repository = repository;
    }
    createRule(id, owner, payload) {
        return this.repository.create(id, owner, payload);
    }
    getById(id) {
        return this.repository.getById(id);
    }
}
exports.default = ParserRulesService;
//# sourceMappingURL=ParserRulesService.js.map