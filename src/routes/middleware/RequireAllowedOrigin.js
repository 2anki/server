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
const constants_1 = require("../../lib/constants");
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const data_layer_1 = require("../../data_layer");
const configureUserLocal_1 = require("./configureUserLocal");
const RequireAllowedOrigin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { origin } = req.headers;
    if (!origin) {
        return res.status(400).send('unknown origin');
    }
    const permitted = constants_1.ALLOWED_ORIGINS.includes(origin);
    console.info(`checking if ${origin} is whitelisted ${permitted}`);
    if (!permitted) {
        return res.status(403).end();
    }
    console.info(`permitted access to ${origin}`);
    res.set('Access-Control-Allow-Origin', origin);
    const database = (0, data_layer_1.getDatabase)();
    const authService = new AuthenticationService_1.default(new TokenRepository_1.default(database), new UsersRepository_1.default(database));
    yield (0, configureUserLocal_1.configureUserLocal)(req, res, authService, database);
    return next();
});
exports.default = RequireAllowedOrigin;
//# sourceMappingURL=RequireAllowedOrigin.js.map