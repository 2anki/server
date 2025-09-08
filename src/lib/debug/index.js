"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDebug = void 0;
/**
 *  If the default bucket is not set, we can safely assume we are running in debug mode.
 * @returns boolean
 */
const IsDebug = () => process.env.SPACES_DEFAULT_BUCKET_NAME === undefined;
exports.IsDebug = IsDebug;
//# sourceMappingURL=index.js.map