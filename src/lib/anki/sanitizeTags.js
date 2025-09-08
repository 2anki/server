"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeTags = (tags) => tags.map(($1) => $1.trim().replace(/\s+/g, '-'));
exports.default = sanitizeTags;
//# sourceMappingURL=sanitizeTags.js.map