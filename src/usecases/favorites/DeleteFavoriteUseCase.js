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
class DeleteFavoriteUseCase {
    constructor(favoriteRepository) {
        this.favoriteRepository = favoriteRepository;
    }
    execute(favoriteId, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const favorite = yield this.favoriteRepository.findById(favoriteId);
            if (!favorite) {
                throw new Error('Favorite not found');
            }
            yield this.favoriteRepository.remove(favoriteId, owner);
        });
    }
}
exports.default = DeleteFavoriteUseCase;
//# sourceMappingURL=DeleteFavoriteUseCase.js.map