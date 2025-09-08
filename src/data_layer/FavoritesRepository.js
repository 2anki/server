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
exports.FavoritesRepository = void 0;
class FavoritesRepository {
    constructor(database) {
        this.database = database;
        this.table = 'favorites';
    }
    getAllByOwner(owner) {
        return this.database(this.table).select('*').where({
            owner,
        });
    }
    addToFavorites({ object_id, owner, type }) {
        return this.database(this.table).insert({
            object_id,
            owner,
            type,
        });
    }
    remove(id, owner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database(this.table).delete().where({
                object_id: id,
                owner,
            });
        });
    }
    findById(id) {
        return this.database(this.table)
            .select('*')
            .where({
            object_id: id,
        })
            .first();
    }
}
exports.FavoritesRepository = FavoritesRepository;
//# sourceMappingURL=FavoritesRepository.js.map