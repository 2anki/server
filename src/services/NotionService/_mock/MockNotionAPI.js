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
const NotionAPIWrapper_1 = __importDefault(require("../NotionAPIWrapper"));
const dataMockPath_1 = __importDefault(require("./helpers/dataMockPath"));
const mockDataExists_1 = require("./helpers/mockDataExists");
const getPayload_1 = __importDefault(require("./helpers/getPayload"));
const savePayload_1 = __importDefault(require("./helpers/savePayload"));
class MockNotionAPI extends NotionAPIWrapper_1.default {
    getBlocks(_a) {
        const _super = Object.create(null, {
            getBlocks: { get: () => super.getBlocks }
        });
        return __awaiter(this, arguments, void 0, function* ({ id, all, }) {
            if ((0, mockDataExists_1.mockDataExists)('ListBlockChildrenResponse', id)) {
                return (0, getPayload_1.default)((0, dataMockPath_1.default)('ListBlockChildrenResponse', id));
            }
            const blocks = yield _super.getBlocks.call(this, {
                createdAt: '',
                lastEditedAt: '',
                id,
                all,
                type: 'page',
            });
            (0, savePayload_1.default)((0, dataMockPath_1.default)('ListBlockChildrenResponse', id), blocks);
            return blocks;
        });
    }
    getPage(id) {
        const _super = Object.create(null, {
            getPage: { get: () => super.getPage }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, mockDataExists_1.mockDataExists)('GetPageResponse', id)) {
                return (0, getPayload_1.default)((0, dataMockPath_1.default)('GetPageResponse', id));
            }
            const page = yield _super.getPage.call(this, id);
            if (page) {
                (0, savePayload_1.default)((0, dataMockPath_1.default)('GetPageResponse', id), page);
            }
            return page;
        });
    }
    getBlock(id) {
        const _super = Object.create(null, {
            getBlock: { get: () => super.getBlock }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, mockDataExists_1.mockDataExists)('GetBlockResponse', id)) {
                return (0, getPayload_1.default)((0, dataMockPath_1.default)('GetBlockResponse', id));
            }
            const block = yield _super.getBlock.call(this, id);
            (0, savePayload_1.default)((0, dataMockPath_1.default)('GetBlockResponse', id), block);
            return block;
        });
    }
    queryDatabase(id, all) {
        const _super = Object.create(null, {
            queryDatabase: { get: () => super.queryDatabase }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, mockDataExists_1.mockDataExists)('QueryDatabaseResponse', id)) {
                return (0, getPayload_1.default)((0, dataMockPath_1.default)('QueryDatabaseResponse', id));
            }
            const query = yield _super.queryDatabase.call(this, id, all);
            (0, savePayload_1.default)((0, dataMockPath_1.default)('QueryDatabaseResponse', id), query);
            return query;
        });
    }
}
exports.default = MockNotionAPI;
//# sourceMappingURL=MockNotionAPI.js.map