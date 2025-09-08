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
exports.NotionService = void 0;
const client_1 = require("@notionhq/client");
const axios_1 = __importDefault(require("axios"));
const hashToken_1 = __importDefault(require("../../lib/misc/hashToken"));
const NotionAPIWrapper_1 = __importDefault(require("./NotionAPIWrapper"));
const getNotionId_1 = require("./getNotionId");
class NotionService {
    constructor(notionRepository) {
        this.notionRepository = notionRepository;
        this.getNotionAPI = (owner) => __awaiter(this, void 0, void 0, function* () {
            const token = yield this.notionRepository.getNotionToken(owner);
            if (!token) {
                throw new Error(client_1.APIErrorCode.Unauthorized);
            }
            return new NotionAPIWrapper_1.default(token, owner);
        });
        this.clientId = process.env.NOTION_CLIENT_ID;
        this.clientSecret = process.env.NOTION_CLIENT_SECRET;
        this.redirectURI = process.env.NOTION_REDIRECT_URI;
    }
    getNotionAuthorizationLink(clientId) {
        return `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&response_type=code`;
    }
    isValidUUID(id) {
        if (!id) {
            return false;
        }
        const regex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
        return regex.exec(id);
    }
    getNotionDatabaseBlock(id, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let cleanId = id.replace(/-/g, '');
            if (cleanId.includes('/')) {
                cleanId = (_a = (0, getNotionId_1.getNotionId)(id)) !== null && _a !== void 0 ? _a : cleanId;
            }
            const client = yield this.getNotionAPI(owner);
            return client.getDatabase(cleanId);
        });
    }
    search(query, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getNotionAPI(owner);
            return client.search(query);
        });
    }
    connectToNotion(authorizationCode, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessData = yield this.getAccessData(authorizationCode.toString());
            yield this.notionRepository.saveNotionToken(owner, accessData, hashToken_1.default);
        });
    }
    getNotionLinkInfo(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const notionData = yield this.notionRepository.getNotionData(owner);
            const clientId = this.clientId;
            const link = this.getNotionAuthorizationLink(clientId);
            if (!notionData) {
                return {
                    link,
                    isConnected: false,
                    workspace: null,
                };
            }
            return {
                link,
                isConnected: !!notionData.token,
                workspace: notionData.workspace_name,
            };
        });
    }
    getAccessData(code) {
        const uri = this.redirectURI;
        const id = this.clientId;
        const secret = this.clientSecret;
        if (!uri || !id || !secret) {
            throw new Error('Notion Connection Handler not configured');
        }
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const url = 'https://api.notion.com/v1/oauth/token';
            const data = {
                grant_type: 'authorization_code',
                code,
            };
            const options = {
                auth: {
                    username: id,
                    password: secret,
                },
                headers: { 'Content-Type': 'application/json' },
            };
            try {
                const res = yield axios_1.default.post(url, data, options);
                if (res.data.access_token) {
                    resolve(res.data);
                }
            }
            catch (err) {
                console.info('Get access data failed');
                console.error(err);
                reject(err);
            }
        }));
    }
    purgeBlockCache(owner) {
        return this.notionRepository.deleteBlocksByOwner(owner);
    }
    getClientId() {
        return this.clientId;
    }
    disconnect(owner) {
        return this.notionRepository.deleteNotionData(owner);
    }
}
exports.NotionService = NotionService;
//# sourceMappingURL=NotionService.js.map