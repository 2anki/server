"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPaying = void 0;
const isPaying = (locals) => {
    if (!locals) {
        return false;
    }
    return locals.patreon || locals.subscriber;
};
exports.isPaying = isPaying;
//# sourceMappingURL=isPaying.js.map