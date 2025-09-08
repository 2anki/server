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
Object.defineProperty(exports, "__esModule", { value: true });
class AddToFavoritesUseCase {
    constructor(favoritesRepository) {
        this.favoritesRepository = favoritesRepository;
    }
    execute(_a) {
        return __awaiter(this, arguments, void 0, function* ({ object_id, owner, type }) {
            const favorite = yield this.favoritesRepository.findById(object_id);
            if (favorite) {
                throw new Error('Already in favorites');
            }
            yield this.favoritesRepository.addToFavorites({ object_id, owner, type });
        });
    }
}
exports.default = AddToFavoritesUseCase;
//# sourceMappingURL=AddToFavoritesUseCase.js.map