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
exports.StripeController = void 0;
const getIndexFileContents_1 = require("../IndexController/getIndexFileContents");
const data_layer_1 = require("../../data_layer");
const EmailService_1 = require("../../services/EmailService/EmailService");
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const UsersService_1 = __importDefault(require("../../services/UsersService"));
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const stripe_1 = require("../../lib/integrations/stripe");
const extractTokenFromCookies_1 = require("./extractTokenFromCookies");
class StripeController {
    getSuccessfulCheckout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const cookies = req.get('cookie');
            const token = (0, extractTokenFromCookies_1.extractTokenFromCookies)(cookies);
            if (!token) {
                return res.send((0, getIndexFileContents_1.getIndexFileContents)());
            }
            const database = (0, data_layer_1.getDatabase)();
            const emailService = (0, EmailService_1.useDefaultEmailService)();
            const userRepository = new UsersRepository_1.default(database);
            const usersService = new UsersService_1.default(userRepository, emailService);
            const tokenRepository = new TokenRepository_1.default(database);
            const authService = new AuthenticationService_1.default(tokenRepository, userRepository);
            const loggedInUser = yield authService.getUserFrom(token);
            const sessionId = req.query.session_id;
            console.log('sessionId', sessionId);
            if (loggedInUser && sessionId) {
                const stripe = (0, stripe_1.getStripe)();
                const session = yield stripe.checkout.sessions.retrieve(sessionId);
                const email = (_a = session.customer_details) === null || _a === void 0 ? void 0 : _a.email;
                if (loggedInUser.email !== email && email) {
                    console.log('updated email for customer');
                    yield usersService.updateSubScriptionEmailUsingPrimaryEmail(email.toLowerCase(), loggedInUser.email.toLowerCase());
                }
            }
            res.send((0, getIndexFileContents_1.getIndexFileContents)());
        });
    }
}
exports.StripeController = StripeController;
//# sourceMappingURL=StripeController.js.map