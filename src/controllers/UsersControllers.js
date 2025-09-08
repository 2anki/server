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
const getRedirect_1 = require("./helpers/getRedirect");
const getIndexFileContents_1 = require("./IndexController/getIndexFileContents");
const getRandomUUID_1 = require("../shared/helpers/getRandomUUID");
const getDefaultAvatarPicture_1 = require("../lib/getDefaultAvatarPicture");
class UsersController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    newPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetToken = req.body.reset_token;
            const { password } = req.body;
            if (this.authService.isNewPasswordValid(resetToken, password)) {
                return res.status(400).send({ message: 'invalid' });
            }
            try {
                yield this.userService.updatePassword(this.authService.getHashPassword(password), resetToken);
                res.status(200).send({ message: 'ok' });
            }
            catch (error) {
                console.info('Update password failed');
                console.error(error);
                next(new Error('Failed to create new password.'));
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            if (!email) {
                console.debug('no email provided');
                return res.status(400).json({ message: 'Email is required' });
            }
            try {
                yield this.userService.sendResetEmail(email, this.authService);
                return res.status(200).json({ message: 'ok' });
            }
            catch (error) {
                console.info('Send reset email failed');
                console.error(error);
                next(error);
            }
        });
    }
    logOut(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.cookies;
            try {
                yield this.authService.logOut(token);
                res.clearCookie('token');
                res.redirect('/');
            }
            catch (error) {
                console.info('Log out failed');
                console.error(error);
                next(error);
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug('Login attempt');
            const { email, password } = req.body;
            if (!this.authService.isValidLogin(email, password)) {
                return res.status(400).json({
                    message: 'Invalid user data. Required  email and password!',
                });
            }
            try {
                const user = yield this.userService.getUserFrom(email);
                if (!user) {
                    console.debug(`No user matching email ${email}`);
                    return res.status(400).json({
                        message: 'Unknown error. Please try again or register a new account.',
                    });
                }
                const isMatch = this.authService.comparePassword(password, user.password);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid password.' });
                }
                const token = yield this.authService.newJWTToken(user);
                if (token) {
                    yield this.authService.persistToken(token, user.id.toString());
                    res.cookie('token', token);
                    res.status(200).json({ token, redirect: (0, getRedirect_1.getRedirect)(req) });
                }
            }
            catch (error) {
                console.info('Login failed');
                console.error(error);
                next(new Error('Failed to login, please try again or register your account.'));
            }
        });
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body ||
                !this.isValidUser(req.body.password, req.body.name, req.body.email)) {
                res.status(400).json({
                    message: 'Invalid user data. Required name, email and password!',
                });
                return;
            }
            const doesUserExist = yield this.userService.getUserFrom(req.body.email);
            if (doesUserExist) {
                console.debug('User already exists');
                return res.status(400).json({ message: 'Register failed' });
            }
            const password = this.authService.getHashPassword(req.body.password);
            const { name, email } = req.body;
            try {
                yield this.userService.register(name, password, email, (0, getDefaultAvatarPicture_1.getDefaultAvatarPicture)());
                res.status(200).json({ message: 'ok' });
            }
            catch (error) {
                console.info('Register failed');
                console.error(error);
                return next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.params.id;
                const isValid = yield this.authService.isValidToken(token);
                if (isValid) {
                    return res.send((0, getIndexFileContents_1.getIndexFileContents)());
                }
                return res.redirect('/login');
            }
            catch (err) {
                console.info('Reset password failed');
                console.error(err);
                next(err);
            }
        });
    }
    getLocals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { locals } = res;
            const user = yield this.authService.getUserFrom(req.cookies.token);
            let linkedEmail = null;
            if (user === null || user === void 0 ? void 0 : user.owner) {
                linkedEmail = yield this.userService.getSubscriptionLinkedEmail(user === null || user === void 0 ? void 0 : user.owner.toString());
            }
            const featureFlags = {
                kiUI: false,
            };
            // featureFlags.kiUI = user?.patreon || res.locals.subscriber;
            const response = {
                user: {
                    id: user === null || user === void 0 ? void 0 : user.id,
                    name: user === null || user === void 0 ? void 0 : user.name,
                    patreon: user === null || user === void 0 ? void 0 : user.patreon,
                    picture: user === null || user === void 0 ? void 0 : user.picture,
                    email: user === null || user === void 0 ? void 0 : user.email,
                },
                locals,
                linked_email: linkedEmail,
                features: featureFlags, // Add feature flags to response
            };
            return res.json(response);
        });
    }
    linkEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info('linkEmail');
            const { email } = req.body;
            const { owner } = res.locals;
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }
            if (!owner) {
                return res.status(400).json({});
            }
            try {
                const emailExists = yield this.userService.checkSubscriptionEmailExists(email);
                if (!emailExists) {
                    console.warn('Linking attempted with non-existent email');
                    return res.status(400).json({ message: 'Failed to link email.' });
                }
                yield this.userService.updateSubscriptionLinkedEmail(owner, email);
                return res.status(200).json({});
            }
            catch (error) {
                console.info('Link email failed');
                console.error(error);
                return res.status(500).json({ message: 'Failed to link email' });
            }
        });
    }
    deleteAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner } = res.locals;
            if (!owner && req.body.confirmed === true) {
                return res.status(400).json({});
            }
            try {
                yield this.userService.deleteUser(owner);
                res.status(200).json({});
            }
            catch (error) {
                console.info('Delete account failed');
                console.error(error);
                return res.status(500).json({ message: 'Failed to delete account' });
            }
        });
    }
    checkUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authService.getUserFrom(req.cookies.token);
            if (!user) {
                res.send((0, getIndexFileContents_1.getIndexFileContents)());
            }
            else {
                res.redirect((0, getRedirect_1.getRedirect)(req));
            }
        });
    }
    patreon(req, res) {
        return res.redirect('https://www.patreon.com/alemayhu');
    }
    isValidUser(password, name, email) {
        if (!password || !name || !email) {
            return false;
        }
        return true;
    }
    loginWithGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug('Login with google');
            const { code } = req.query;
            if (!code) {
                return res.redirect('/login');
            }
            const loginRequest = yield this.authService.loginWithGoogle(code);
            if (loginRequest) {
                /**
                 * now create a new user if the user does not exist
                 */
                const { email, name, picture } = loginRequest;
                let user = yield this.userService.getUserFrom(email);
                if (!user) {
                    // Create user with random password
                    yield this.userService.register(name, (0, getRandomUUID_1.getRandomUUID)(), email, picture);
                    user = yield this.userService.getUserFrom(email);
                }
                if (!user) {
                    console.info('Failed to create user');
                    return res
                        .status(400)
                        .send('Unknown error. Please try again or register a new account.');
                }
                if (picture != user.picture) {
                    yield this.userService.updatePicture(user.id, picture);
                }
                const token = yield this.authService.newJWTToken(user);
                if (!token) {
                    console.info('Failed to create token');
                    return res
                        .status(400)
                        .send('Unknown error. Please try again or register a new account.');
                }
                yield this.authService.persistToken(token, user.id.toString());
                res.cookie('token', token);
                res.status(200).redirect((0, getRedirect_1.getRedirect)(req));
            }
            else {
                res.redirect('/login');
            }
        });
    }
    getAvatar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!res.locals.owner) {
                return res.status(400).json({ message: 'Missing owner' });
            }
            const user = yield this.userService.getUserById(res.locals.owner);
            const name = user.name;
            const picture = user.picture;
            const email = user.email;
            return res.json({ name, picture, email });
        });
    }
}
exports.default = UsersController;
//# sourceMappingURL=UsersControllers.js.map