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
const data_layer_1 = require("../data_layer");
const NotionRespository_1 = __importDefault(require("../data_layer/NotionRespository"));
const sendErrorResponse_1 = __importDefault(require("../lib/sendErrorResponse"));
const NotionService_1 = __importDefault(require("../services/NotionService"));
const getReturnStatusCodeFromBoolean_1 = require("./helpers/getReturnStatusCodeFromBoolean");
class FavoritesController {
    constructor(service) {
        this.service = service;
    }
    createFavorite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, type } = req.body;
                const { owner } = res.locals;
                const didCreate = yield this.service.create({
                    object_id: id,
                    owner,
                    type,
                });
                res.status((0, getReturnStatusCodeFromBoolean_1.getReturnStatusCodeFromBoolean)(didCreate)).send();
            }
            catch (error) {
                (0, sendErrorResponse_1.default)(error, res);
            }
        });
    }
    deleteFavorite(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { owner } = res.locals;
                const { id } = req.body;
                const didDelete = yield this.service.delete(id, owner);
                res.status((0, getReturnStatusCodeFromBoolean_1.getReturnStatusCodeFromBoolean)(didDelete)).send();
            }
            catch (error) {
                (0, sendErrorResponse_1.default)(error, res);
            }
        });
    }
    getFavorites(_req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner } = res.locals;
            try {
                const notionRepository = new NotionRespository_1.default((0, data_layer_1.getDatabase)());
                const notionService = new NotionService_1.default(notionRepository);
                const favorites = yield this.service.getFavoritesByOwner(owner, notionService);
                res.json(favorites);
            }
            catch (error) {
                console.error(error);
                res.json([]);
            }
        });
    }
}
exports.default = FavoritesController;
//# sourceMappingURL=FavoritesController.js.map