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
exports.configureUserLocal = configureUserLocal;
function configureUserLocal(req, res, authService, database) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield authService.getUserFrom(req.cookies.token);
        if (user) {
            res.locals.owner = user.owner;
            res.locals.patreon = user.patreon;
            res.locals.subscriber = yield authService.getIsSubscriber(database, user.email);
            res.locals.subscriptionInfo = yield authService.getSubscriptionInfo(database, user.email);
        }
    });
}
//# sourceMappingURL=configureUserLocal.js.map