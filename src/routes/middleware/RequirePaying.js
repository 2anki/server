"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const data_layer_1 = require("../../data_layer");
const configureUserLocal_1 = require("./configureUserLocal");
const isPaying_1 = require("../../lib/isPaying");
const RequirePaying = (req, res, next) => {
    const database = (0, data_layer_1.getDatabase)();
    const authService = new AuthenticationService_1.default(new TokenRepository_1.default(database), new UsersRepository_1.default(database));
    (0, configureUserLocal_1.configureUserLocal)(req, res, authService, database);
    if (!(0, isPaying_1.isPaying)(res.locals)) {
        return res.redirect('/pricing');
    }
    return next();
};
exports.default = RequirePaying;
//# sourceMappingURL=RequirePaying.js.map