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
const favorites_1 = require("../entities/favorites");
const AddToFavoritesUseCase_1 = __importDefault(require("../usecases/favorites/AddToFavoritesUseCase"));
const DeleteFavoriteUseCase_1 = __importDefault(require("../usecases/favorites/DeleteFavoriteUseCase"));
const GetAllFavoritesByOwnerUseCase_1 = __importDefault(require("../usecases/favorites/GetAllFavoritesByOwnerUseCase"));
class FavoriteService {
    constructor(repository) {
        this.repository = repository;
    }
    create(newFavorite) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, favorites_1.isValidFavoriteInput)(newFavorite.object_id, newFavorite.type)) {
                return false;
            }
            const useCase = new AddToFavoritesUseCase_1.default(this.repository);
            yield useCase.execute(newFavorite);
            return true;
        });
    }
    delete(id, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const useCase = new DeleteFavoriteUseCase_1.default(this.repository);
            yield useCase.execute(id, owner);
            return true;
        });
    }
    getFavoritesByOwner(owner, notionService) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!owner) {
                return [];
            }
            const useCase = new GetAllFavoritesByOwnerUseCase_1.default(this.repository);
            const favorites = yield useCase.execute(owner);
            /**
             * XXX: This should be moved to a different service.
             * What is happening here is that we fetch the Notion block so we can present the user
             * with a rich object (with title and emoji) instead of just the ID.
             */
            const api = yield notionService.getNotionAPI(owner);
            if (!api) {
                return [];
            }
            return Promise.all(favorites.map((f) => (f.type === 'page'
                ? api.getPage(f.object_id)
                : api.getDatabase(f.object_id)).catch((error) => {
                if (error instanceof client_1.APIResponseError) {
                    this.delete(f.object_id, owner);
                }
            })));
        });
    }
}
exports.default = FavoriteService;
//# sourceMappingURL=FavoriteService.js.map