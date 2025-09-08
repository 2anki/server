"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getEmailFromOwner;
function getEmailFromOwner(DB, id) {
    return DB('users').where({ id }).returning(['email']).first();
}
//# sourceMappingURL=getEmailFromOwner.js.map