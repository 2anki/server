"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const unHashToken_1 = __importDefault(require("../lib/misc/unHashToken"));
class NotionRepository {
    constructor(database) {
        this.database = database;
        this.notionTokensTable = 'notion_tokens';
        this.notionBlocksTable = 'blocks';
    }
    getNotionData(owner) {
        if (!owner) {
            return Promise.resolve(null);
        }
        return this.database(this.notionTokensTable)
            .where({ owner: owner })
            .returning(['token', 'workspace_name'])
            .first();
    }
    saveNotionToken(user, data, hash) {
        return new Promise((resolve, reject) => {
            this.database(this.notionTokensTable)
                .insert({
                token_type: data.token_type,
                bot_id: data.bot_id,
                workspace_name: data.workspace_name,
                workspace_icon: data.workspace_icon,
                workspace_id: data.workspace_id,
                notion_owner: data.owner, // This actually JSON blob from Notion and not related to our owner id
                token: hash(data.access_token),
                owner: user,
            })
                .onConflict('owner')
                .merge()
                .then(() => {
                resolve(true);
            })
                .catch((err) => {
                reject(err);
            });
        });
    }
    /**
     * Retrieve the users notion token.
     * If the user does not have a token, throws error.
     * The caller is expected to handle this error.
     *
     * @param owner user id
     * @returns unhashed token
     */
    getNotionToken(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield this.database('notion_tokens')
                .where({ owner })
                .returning('token')
                .first();
            /**
             * The user can disconnect Notion at any point so we should not throw an error here.
             */
            if (!row) {
                return Promise.resolve(null);
            }
            return (0, unHashToken_1.default)(row.token);
        });
    }
    deleteBlocksByOwner(owner) {
        return this.database(this.notionBlocksTable).del().where({ owner });
    }
    /**
     * Delete the users notion token when they disconnect
     */
    deleteNotionData(owner) {
        return this.database(this.notionTokensTable).where({ owner: owner }).del();
    }
}
exports.default = NotionRepository;
//# sourceMappingURL=NotionRespository.js.map