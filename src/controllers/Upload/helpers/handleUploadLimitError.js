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
exports.handleUploadLimitError = void 0;
const EmailService_1 = require("../../../services/EmailService/EmailService");
const UsersService_1 = __importDefault(require("../../../services/UsersService"));
const UsersRepository_1 = __importDefault(require("../../../data_layer/UsersRepository"));
const data_layer_1 = require("../../../data_layer");
const handleUploadLimitError = (req, response) => __awaiter(void 0, void 0, void 0, function* () {
    const owner = response.locals.owner;
    // If the user is already logged in, redirect to the pricing page
    if (owner) {
        const database = (0, data_layer_1.getDatabase)();
        const emailService = (0, EmailService_1.useDefaultEmailService)();
        const usersService = new UsersService_1.default(new UsersRepository_1.default(database), emailService);
        const user = yield usersService.getUserById(response.locals.owner);
        if (user) {
            return response.redirect('/pricing?error=upload_limit_exceeded');
        }
    }
    response.redirect('/login?error=upload_limit_exceeded');
});
exports.handleUploadLimitError = handleUploadLimitError;
//# sourceMappingURL=handleUploadLimitError.js.map