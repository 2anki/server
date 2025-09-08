"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsePlainTextUseCase = void 0;
class ParsePlainTextUseCase {
    constructor(parser) {
        this.parser = parser;
    }
    execute(text) {
        return this.parser.parse(text);
    }
}
exports.ParsePlainTextUseCase = ParsePlainTextUseCase;
//# sourceMappingURL=ParsePlainTextUseCase.js.map