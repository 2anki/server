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
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const data_layer_1 = require("../../data_layer");
const configureUserLocal_1 = require("./configureUserLocal");
const RequireAuthentication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const shouldDebug = req.query.debug === 'true';
    if (shouldDebug)
        console.info('RequireAuthentication: Starting authentication check');
    const database = (0, data_layer_1.getDatabase)();
    if (shouldDebug)
        console.debug('RequireAuthentication: Database initialized');
    const authService = new AuthenticationService_1.default(new TokenRepository_1.default(database), new UsersRepository_1.default(database));
    if (shouldDebug)
        console.debug('RequireAuthentication: Auth service created');
    yield (0, configureUserLocal_1.configureUserLocal)(req, res, authService, database);
    if (shouldDebug)
        console.debug('RequireAuthentication: User local configured');
    return next();
});
exports.default = RequireAuthentication;
//# sourceMappingURL=RequireAuthentication.js.map