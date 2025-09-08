"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TagRegistry {
    constructor() {
        this.strikethroughs = [];
        this.headings = [];
    }
    static getInstance() {
        if (!TagRegistry._instance) {
            TagRegistry._instance = new TagRegistry();
        }
        return TagRegistry._instance;
    }
    addHeading(heading) {
        this.headings.push(heading);
    }
    addStrikethrough(strikethrough) {
        this.strikethroughs.push(strikethrough);
    }
    clear() {
        this.headings = [];
        this.strikethroughs = [];
    }
}
exports.default = TagRegistry;
//# sourceMappingURL=TagRegistry.js.map