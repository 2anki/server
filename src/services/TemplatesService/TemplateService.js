"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
class TemplateService {
    constructor(repository) {
        this.repository = repository;
    }
    create(owner, templates) {
        return this.repository.create({
            owner: owner,
            payload: templates,
        });
    }
    delete(owner) {
        return this.repository.delete(owner);
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=TemplateService.js.map