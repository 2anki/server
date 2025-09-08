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
const client_1 = require("@notionhq/client");
const get_notion_object_title_1 = require("get-notion-object-title");
const sanitizeTags_1 = __importDefault(require("../../lib/anki/sanitizeTags"));
const getParagraphBlocks_1 = require("./helpers/getParagraphBlocks");
const renderIcon_1 = __importDefault(require("./helpers/renderIcon"));
const getBlockIcon_1 = __importDefault(require("./blocks/getBlockIcon"));
const isHeading_1 = require("./helpers/isHeading");
const getHeadingText_1 = require("./helpers/getHeadingText");
const getBlockCache_1 = require("./helpers/getBlockCache");
const data_layer_1 = require("../../data_layer");
const DEFAULT_PAGE_SIZE_LIMIT = 100 * 2;
class NotionAPIWrapper {
    constructor(key, owner) {
        this.notion = new client_1.Client({ auth: key });
        this.owner = owner;
    }
    getPage(id) {
        return this.notion.pages.retrieve({ page_id: id });
    }
    getBlocks(_a) {
        return __awaiter(this, arguments, void 0, function* ({ createdAt, lastEditedAt, id, all, type, }) {
            console.time(`getBlocks:${id}${all}`);
            // Skip unsupported types to prevent validation errors
            if (type === 'unsupported') {
                return {
                    type: 'block',
                    block: {},
                    object: 'list',
                    next_cursor: null,
                    has_more: false,
                    results: [],
                };
            }
            const cachedPayload = all
                ? yield (0, getBlockCache_1.getBlockCache)({
                    database: (0, data_layer_1.getDatabase)(),
                    id,
                    owner: this.owner,
                    lastEditedAt,
                })
                : null;
            if (cachedPayload) {
                console.log('using payload cache');
                console.timeEnd(`getBlocks:${id}${all}`);
                return cachedPayload;
            }
            const response = yield this.notion.blocks.children.list({
                block_id: id,
                page_size: DEFAULT_PAGE_SIZE_LIMIT,
            });
            console.log('received', response.results.length, 'blocks');
            if (all && response.has_more && response.next_cursor) {
                while (true) {
                    const { results, next_cursor: nextCursor } = yield this.notion.blocks.children.list({
                        block_id: id,
                        start_cursor: response.next_cursor,
                    });
                    console.log('found more', results.length, 'blocks');
                    response.results.push(...results);
                    if (nextCursor) {
                        response.next_cursor = nextCursor;
                    }
                    else {
                        console.log('done getting blocks');
                        break;
                    }
                }
            }
            if (!createdAt || !lastEditedAt) {
                console.log('not enough input block cache');
            }
            else {
                const database = (0, data_layer_1.getDatabase)();
                yield database('blocks')
                    .insert({
                    owner: this.owner,
                    object_id: id,
                    payload: JSON.stringify(response),
                    fetch: 1,
                    created_at: createdAt,
                    last_edited_time: lastEditedAt,
                })
                    .onConflict('object_id')
                    .merge();
            }
            console.timeEnd(`getBlocks:${id}${all}`);
            return response;
        });
    }
    getBlock(id) {
        return this.notion.blocks.retrieve({
            block_id: id,
        });
    }
    deleteBlock(id) {
        return this.notion.blocks.delete({
            block_id: id,
        });
    }
    createBlock(parent, newBlock) {
        return this.notion.blocks.children.append({
            block_id: parent,
            children: [newBlock],
        });
    }
    getDatabase(id) {
        return this.notion.databases.retrieve({ database_id: id });
    }
    queryDatabase(id, all) {
        return __awaiter(this, void 0, void 0, function* () {
            console.time(`queryDatabase:${id}${all}`);
            const response = yield this.notion.databases.query({
                database_id: id,
                page_size: DEFAULT_PAGE_SIZE_LIMIT,
            });
            if (all && response.has_more && response.next_cursor) {
                while (true) {
                    const res2 = yield this.notion.databases.query({
                        database_id: id,
                        page_size: DEFAULT_PAGE_SIZE_LIMIT,
                        start_cursor: response.next_cursor,
                    });
                    response.results.push(...res2.results);
                    if (res2.next_cursor) {
                        response.next_cursor = res2.next_cursor;
                    }
                    else {
                        break;
                    }
                }
            }
            console.timeEnd(`queryDatabase:${id}${all}`);
            return response;
        });
    }
    search(query, all) {
        return __awaiter(this, void 0, void 0, function* () {
            console.time(`search:${all}`);
            const response = yield this.notion.search({
                page_size: DEFAULT_PAGE_SIZE_LIMIT,
                query,
                sort: {
                    direction: 'descending',
                    timestamp: 'last_edited_time',
                },
            });
            if (all && response.has_more && response.next_cursor) {
                while (true) {
                    const res2 = yield this.notion.search({
                        page_size: DEFAULT_PAGE_SIZE_LIMIT,
                        query,
                        start_cursor: response.next_cursor,
                        sort: {
                            direction: 'descending',
                            timestamp: 'last_edited_time',
                        },
                    });
                    response.results.push(...res2.results);
                    if (res2.next_cursor) {
                        response.next_cursor = res2.next_cursor;
                    }
                    else {
                        break;
                    }
                }
            }
            console.timeEnd(`search:${all}`);
            return response;
        });
    }
    static GetClientID() {
        return process.env.NOTION_CLIENT_ID;
    }
    getTopLevelTags(pageId, rules) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.time('[NO_CACHE] - getTopLevelTags');
            const useHeadings = rules.TAGS === 'heading';
            const response = yield this.getBlocks({
                createdAt: '',
                lastEditedAt: '',
                id: pageId,
                all: rules.UNLIMITED,
                type: 'page',
            });
            const globalTags = [];
            if (useHeadings) {
                const headings = response.results.filter((block) => (0, isHeading_1.isHeading)(block));
                for (const heading of headings) {
                    if ((0, client_1.isFullBlock)(heading)) {
                        const newTag = (_a = (0, getHeadingText_1.getHeadingText)(heading)) === null || _a === void 0 ? void 0 : _a.map((t) => t.plain_text).join('');
                        if (newTag) {
                            globalTags.push(newTag);
                        }
                    }
                }
            }
            else {
                const paragraphs = (0, getParagraphBlocks_1.getParagraphBlocks)(response.results);
                for (const p of paragraphs) {
                    const pp = p.paragraph;
                    if (!pp) {
                        continue;
                    }
                    const tt = pp.rich_text;
                    if (!tt || tt.length < 1) {
                        continue;
                    }
                    const { annotations } = tt[0];
                    if (annotations.strikethrough) {
                        globalTags.push(tt[0].plain_text);
                    }
                }
            }
            console.timeEnd('[NO_CACHE] - getTopLevelTags');
            return (0, sanitizeTags_1.default)(globalTags);
        });
    }
    getBlockTitle(icon, title, settings) {
        if (!icon) {
            return title;
        }
        // the order here matters due to icon not being set and last not being default
        return settings.pageEmoji !== 'last_emoji'
            ? `${icon}${title}`
            : `${title}${icon}`;
    }
    getPageTitle(page, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!page) {
                return '';
            }
            let title = (_a = (0, get_notion_object_title_1.getNotionObjectTitle)(page, { emoji: false })) !== null && _a !== void 0 ? _a : `Untitled: ${new Date()}`;
            let icon = yield (0, renderIcon_1.default)((0, getBlockIcon_1.default)(page, settings.pageEmoji));
            return this.getBlockTitle(icon, title, settings);
        });
    }
    getDatabaseTitle(database, settings) {
        return __awaiter(this, void 0, void 0, function* () {
            let icon = yield (0, renderIcon_1.default)((0, getBlockIcon_1.default)(database, settings.pageEmoji));
            let title = (0, client_1.isFullDatabase)(database)
                ? database.title.map((t) => t.plain_text).join('')
                : '';
            return this.getBlockTitle(icon, title, settings);
        });
    }
}
exports.default = NotionAPIWrapper;
//# sourceMappingURL=NotionAPIWrapper.js.map