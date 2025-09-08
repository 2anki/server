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
const querystring_1 = __importDefault(require("querystring"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const axios_1 = __importDefault(require("axios"));
class AuthenticationService {
    constructor(tokenRepository, usersRepository) {
        this.tokenRepository = tokenRepository;
        this.usersRepository = usersRepository;
    }
    isValidToken(token) {
        return new Promise((resolve, reject) => {
            if (!token) {
                resolve(false);
                return;
            }
            jsonwebtoken_1.default.verify(token, process.env.SECRET, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
    newResetToken() {
        return crypto_1.default.randomBytes(64).toString('hex');
    }
    isValidResetToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token || token.length < 128) {
                return false;
            }
            const user = yield this.usersRepository.getByResetToken(token);
            return user === null || user === void 0 ? void 0 : user.reset_token;
        });
    }
    newJWTToken(userId) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.sign({ userId }, process.env.SECRET, 
            // TODO: let user decide expiry
            // { expiresIn: "1d" },
            (error, token) => {
                if (error) {
                    reject(error);
                }
                else if (token) {
                    resolve(token);
                }
                else {
                    reject(new Error('Token is undefined'));
                }
            });
        });
    }
    getUserFrom(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.isValidToken(token);
            if (!isValid) {
                return null;
            }
            const accessToken = yield this.tokenRepository.getAccessTokenFromString(token);
            if (!accessToken) {
                return null;
            }
            const user = yield this.usersRepository.getById(accessToken.owner.toString());
            if (!(user === null || user === void 0 ? void 0 : user.id)) {
                return null;
            }
            return Object.assign(Object.assign({}, user), { owner: user.id });
        });
    }
    isNewPasswordValid(resetToken, password) {
        return (!resetToken || resetToken.length < 128 || !password || password.length < 8);
    }
    logOut(token) {
        return this.tokenRepository.deleteAccessToken(token);
    }
    isValidLogin(email, password) {
        return email && password && password.length >= 8;
    }
    getHashPassword(password) {
        return bcryptjs_1.default.hashSync(password, 12);
    }
    comparePassword(password, hash) {
        return bcryptjs_1.default.compareSync(password, hash);
    }
    persistToken(token, id) {
        return this.tokenRepository.updateAccessToken(token, id);
    }
    getIsSubscriber(db, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const linkedEmail = yield db('subscriptions')
                .select('active')
                .where({ linked_email: email.toLowerCase() })
                .first();
            if (linkedEmail === null || linkedEmail === void 0 ? void 0 : linkedEmail.active) {
                return true;
            }
            const result = yield db('subscriptions')
                .select('active')
                .where({ email: email.toLowerCase() })
                .first();
            return (_a = result === null || result === void 0 ? void 0 : result.active) !== null && _a !== void 0 ? _a : false;
        });
    }
    getSubscriptionInfo(db, email) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const linkedEmail = yield db('subscriptions')
                .select(['active', 'email', 'linked_email'])
                .where({ linked_email: email.toLowerCase() })
                .first();
            if (linkedEmail === null || linkedEmail === void 0 ? void 0 : linkedEmail.active) {
                return {
                    active: true,
                    email: linkedEmail.email,
                    linked_email: linkedEmail.linked_email,
                };
            }
            const result = yield db('subscriptions')
                .select(['active', 'email', 'linked_email'])
                .where({ email: email.toLowerCase() })
                .first();
            return {
                active: (_a = result === null || result === void 0 ? void 0 : result.active) !== null && _a !== void 0 ? _a : false,
                email: result === null || result === void 0 ? void 0 : result.email,
                linked_email: result === null || result === void 0 ? void 0 : result.linked_email,
            };
        });
    }
    loginWithGoogle(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = 'https://oauth2.googleapis.com/token';
            const values = {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            };
            try {
                const result = yield axios_1.default.post(url, querystring_1.default.stringify(values), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
                const idToken = result.data.id_token;
                const decoded = jsonwebtoken_1.default.decode(idToken);
                console.log('decoded', decoded);
                return {
                    // @ts-ignore
                    email: decoded.email,
                    // @ts-ignore
                    name: decoded.name,
                    // @ts-ignore
                    picture: decoded.picture,
                };
            }
            catch (error) {
                console.info("Couldn't login with Google");
                console.error(error);
            }
        });
    }
}
exports.default = AuthenticationService;
//# sourceMappingURL=AuthenticationService.js.map