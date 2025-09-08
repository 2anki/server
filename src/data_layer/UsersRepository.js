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
class UsersRepository {
    constructor(database) {
        this.database = database;
        this.database = database;
        this.table = 'users';
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.database.table(this.table).where({ id }).first();
            return user;
        });
    }
    updatePassword(hashPassword, reset_token) {
        return this.database(this.table)
            .where({ reset_token })
            .update({ password: hashPassword, reset_token: null });
    }
    getByResetToken(token) {
        return this.database(this.table).where({ reset_token: token }).first();
    }
    getByEmail(email) {
        return this.database(this.table)
            .whereRaw('TRIM(email) = ?', [email.toLocaleLowerCase().trim()])
            .returning(['reset_token', 'id'])
            .first();
    }
    updateResetToken(id, resetToken) {
        return this.database(this.table)
            .where({ id })
            .update({ reset_token: resetToken });
    }
    createUser(name, password, email, picture) {
        return this.database(this.table)
            .insert({
            name,
            password,
            email,
            picture,
        })
            .returning(['id']);
    }
    deleteUser(owner) {
        const ownerTables = [
            'access_tokens',
            'favorites',
            'jobs',
            'notion_tokens',
            'settings',
            'templates',
            'uploads',
            'blocks',
            'dropbox_uploads',
            'google_drive_uploads',
        ];
        return Promise.all([
            ...ownerTables.map((tableName) => this.database(tableName).where({ owner }).del()),
            this.database(this.table).where({ id: owner }).del(),
        ]);
    }
    linkCurrentUserWithEmail(owner, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.database(this.table).where({ id: owner }).first();
            if (!user) {
                return null;
            }
            return this.updateSubScriptionEmailUsingPrimaryEmail(user.email, email);
        });
    }
    updateSubScriptionEmailUsingPrimaryEmail(email, newEmail) {
        return this.database('subscriptions')
            .where({ email: email.toLowerCase() })
            .update({ linked_email: newEmail.toLowerCase() });
    }
    getSubscriptionLinkedEmail(owner) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.database(this.table).where({ id: owner }).first();
            if (!user) {
                return null;
            }
            const subscription = yield this.database('subscriptions')
                .where({ email: user.email.toLowerCase() })
                .select('linked_email')
                .first();
            return subscription === null || subscription === void 0 ? void 0 : subscription.linked_email;
        });
    }
    updatePicture(id, picture) {
        return this.database(this.table).where({ id }).update({ picture });
    }
    updatePatreonByEmail(email, patreon) {
        return this.database(this.table).where({ email }).update({ patreon });
    }
    checkSubscriptionEmailExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = yield this.database('subscriptions')
                .where({ email: email.toLowerCase() })
                .first();
            return !!subscription;
        });
    }
}
exports.default = UsersRepository;
//# sourceMappingURL=UsersRepository.js.map