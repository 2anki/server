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
const performConversion_1 = __importDefault(require("../lib/storage/jobs/helpers/performConversion"));
const Settings_1 = __importDefault(require("../lib/parser/Settings"));
const BlockHandler_1 = __importDefault(require("../services/NotionService/BlockHandler/BlockHandler"));
const CustomExporter_1 = __importDefault(require("../lib/parser/exporters/CustomExporter"));
const WorkSpace_1 = __importDefault(require("../lib/parser/WorkSpace"));
const blockToStaticMarkup_1 = require("../services/NotionService/helpers/blockToStaticMarkup");
const data_layer_1 = require("../data_layer");
const getNotionId_1 = require("../services/NotionService/getNotionId");
const getOwner_1 = require("../lib/User/getOwner");
const client_1 = require("@notionhq/client");
const sendErrorResponse_1 = __importDefault(require("../lib/sendErrorResponse"));
const isPaying_1 = require("../lib/isPaying");
class NotionController {
    constructor(service) {
        this.service = service;
    }
    connect(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { code } = req.query;
            if (!code) {
                return res.redirect('/search');
            }
            try {
                const authorizationCode = code;
                yield this.service.connectToNotion(authorizationCode, res.locals.owner);
                return res.redirect('/search');
            }
            catch (err) {
                console.info('Connect to Notion failed');
                console.error(err);
                return res.redirect('/search');
            }
        });
    }
    search(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check for Notion connection first
                const linkInfo = yield this.service.getNotionLinkInfo(res.locals.owner);
                if (!linkInfo.isConnected) {
                    const renewalLink = this.service.getNotionAuthorizationLink(this.service.getClientId());
                    return res.status(401).json({
                        message: `Notion is not connected. Please connect your account <a href='${renewalLink}'>here</a>.`,
                    });
                }
                // Proceed with search if connected
                const query = req.body.query.toString() || '';
                const result = yield this.service.search(query, (0, getOwner_1.getOwner)(res));
                res.json(result);
            }
            catch (err) {
                if (err instanceof client_1.APIResponseError) {
                    if (err.code === client_1.APIErrorCode.Unauthorized) {
                        const renewalLink = this.service.getNotionAuthorizationLink(this.service.getClientId());
                        err.message += `You can renew it <a href='${renewalLink}'>here</a>.`;
                    }
                    (0, sendErrorResponse_1.default)(err, res);
                }
            }
        });
    }
    getNotionLink(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug('/get-notion-link');
            const clientId = this.service.getClientId();
            if (!clientId) {
                return res.status(400).send();
            }
            const linkInfo = yield this.service.getNotionLinkInfo(res.locals.owner);
            return res.status(200).send(linkInfo);
        });
    }
    convert(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const { id, title, type } = req.body;
            if (!id) {
                return res.status(400).send({ error: 'id is required' });
            }
            return (0, performConversion_1.default)((0, data_layer_1.getDatabase)(), {
                api,
                id,
                type,
                owner: res.locals.owner,
                res,
                title: title !== null && title !== void 0 ? title : 'Untitled',
            });
        });
    }
    getPage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const page = yield api.getPage(id.replace(/-/g, ''));
            return res.json(page);
        });
    }
    getBlocks(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            console.info('[NO_CACHE] - getBlocks');
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const blocks = yield api.getBlocks({
                all: (0, isPaying_1.isPaying)(res.locals),
                createdAt: '',
                lastEditedAt: '',
                id,
                type: 'page',
            });
            res.json(blocks);
        });
    }
    getBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const block = yield api.getBlock(id);
            res.json(block);
        });
    }
    createBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const block = yield api.createBlock(id, req.body.newBlock);
            res.json(block);
        });
    }
    deleteBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const block = yield api.deleteBlock(id);
            return res.json(block);
        });
    }
    renderBlock(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            if (!this.service.isValidUUID(id)) {
                return res.status(400).send();
            }
            const query = id.replace(/-/g, '');
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const blockId = (_a = (0, getNotionId_1.getNotionId)(query)) !== null && _a !== void 0 ? _a : query;
            const block = yield api.getBlock(blockId);
            const settings = new Settings_1.default(Settings_1.default.LoadDefaultOptions());
            let handler = new BlockHandler_1.default(new CustomExporter_1.default('x', new WorkSpace_1.default(true, 'fs').location), api, settings);
            yield handler.getBackSide(block, false);
            const frontSide = yield (0, blockToStaticMarkup_1.blockToStaticMarkup)(handler, block);
            return res.json({ html: frontSide });
        });
    }
    getDatabase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!this.service.isValidUUID(id)) {
                return res.status(400).send();
            }
            try {
                const database = yield this.service.getNotionDatabaseBlock(id, res.locals.owner);
                return res.json(database);
            }
            catch (error) {
                console.info('Get database failed');
                console.error(error);
                res.status(500).send();
            }
        });
    }
    queryDatabase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.service.getNotionAPI(res.locals.owner);
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            const results = yield api.queryDatabase(id);
            res.json(results);
        });
    }
    disconnect(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletion = yield this.service.disconnect(res.locals.owner);
                res.status(200).send({ didDelete: deletion });
            }
            catch (err) {
                console.info('Disconnect from Notion failed');
                console.error(err);
                res.status(500).send({ didDelete: false });
            }
        });
    }
}
exports.default = NotionController;
//# sourceMappingURL=NotionController.js.map