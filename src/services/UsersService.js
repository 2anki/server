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
class UsersService {
    constructor(repository, emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }
    updatePassword(password, resetToken) {
        return this.repository.updatePassword(password, resetToken);
    }
    sendResetEmail(email, authService) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.repository.getByEmail(email);
            if (!(user === null || user === void 0 ? void 0 : user.id)) {
                console.debug('no user found');
                return;
            }
            console.debug('user found');
            const resetToken = yield this.getOrCreateResetToken(user, authService);
            this.emailService.sendResetEmail(email, resetToken);
        });
    }
    getOrCreateResetToken(user, authService) {
        return __awaiter(this, void 0, void 0, function* () {
            if (user.reset_token) {
                return user.reset_token;
            }
            const resetToken = authService.newResetToken();
            yield this.repository.updateResetToken(user.id.toString(), resetToken);
            return resetToken;
        });
    }
    getUserFrom(email) {
        return this.repository.getByEmail(email);
    }
    register(name, password, email, picture) {
        return this.repository.createUser(name, password, email.toLowerCase(), picture);
    }
    deleteUser(owner) {
        return this.repository.deleteUser(owner);
    }
    updateSubscriptionLinkedEmail(owner, email) {
        return this.repository.linkCurrentUserWithEmail(owner, email);
    }
    updateSubScriptionEmailUsingPrimaryEmail(email, newEmail) {
        return this.repository.updateSubScriptionEmailUsingPrimaryEmail(email, newEmail);
    }
    getSubscriptionLinkedEmail(owner) {
        return this.repository.getSubscriptionLinkedEmail(owner);
    }
    checkSubscriptionEmailExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscription = yield this.repository.checkSubscriptionEmailExists(email);
            return !!subscription;
        });
    }
    getUserById(owner) {
        return this.repository.getById(owner);
    }
    updatePicture(id, picture) {
        return this.repository.updatePicture(id, picture);
    }
}
exports.default = UsersService;
//# sourceMappingURL=UsersService.js.map