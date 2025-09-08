"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TokenRepository {
    constructor(database) {
        this.database = database;
        this.table = 'access_tokens';
    }
    getAccessToken(req) {
        return this.database(this.table)
            .where({ token: req.cookies.token })
            .first();
    }
    getAccessTokenFromString(token) {
        return this.database(this.table).where({ token: token }).first();
    }
    deleteAccessToken(token) {
        return this.database(this.table).where({ token }).del();
    }
    updateAccessToken(token, id) {
        return this.database(this.table)
            .insert({
            token,
            owner: id,
        })
            .onConflict('owner')
            .merge();
    }
}
exports.default = TokenRepository;
//# sourceMappingURL=TokenRepository.js.map