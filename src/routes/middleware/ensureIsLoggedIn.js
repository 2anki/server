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
exports.ensureIsLoggedIn = void 0;
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const data_layer_1 = require("../../data_layer");
const ensureIsLoggedIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authService = new AuthenticationService_1.default(new TokenRepository_1.default((0, data_layer_1.getDatabase)()), new UsersRepository_1.default((0, data_layer_1.getDatabase)()));
    const user = yield authService.getUserFrom(req.cookies.token);
    if (!user) {
        res.redirect('/login');
        return false;
    }
    else {
        return true;
    }
});
exports.ensureIsLoggedIn = ensureIsLoggedIn;
//# sourceMappingURL=ensureIsLoggedIn.js.map