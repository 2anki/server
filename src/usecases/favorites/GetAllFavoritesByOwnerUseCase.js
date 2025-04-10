"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GetAllFavoritesByOwnerUseCase {
    constructor(favoritesRepository) {
        this.favoritesRepository = favoritesRepository;
    }
    execute(ownerId) {
        return this.favoritesRepository.getAllByOwner(ownerId);
    }
}
exports.default = GetAllFavoritesByOwnerUseCase;
//# sourceMappingURL=GetAllFavoritesByOwnerUseCase.js.map