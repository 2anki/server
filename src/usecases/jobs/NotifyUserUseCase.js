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
exports.NotifyUserUseCase = void 0;
const getEmailFromOwner_1 = __importDefault(require("../../lib/User/getEmailFromOwner"));
const EmailService_1 = require("../../services/EmailService/EmailService");
class NotifyUserUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, rules, db, key, id, size, apkg } = input;
            console.debug('rules.email', rules.EMAIL_NOTIFICATION);
            // TODO: use UserRepository to get user email
            const email = yield (0, getEmailFromOwner_1.default)(db, owner);
            const emailService = (0, EmailService_1.useDefaultEmailService)();
            // Notify for files bigger than 24MB or if email notifications are not enabled
            if (size > 24) {
                const link = `${process.env.DOMAIN}/api/download/u/${key}`;
                yield emailService.sendConversionLinkEmail(email, id, link);
            }
            // Always notify if email notifications are enabled
            else if (rules.EMAIL_NOTIFICATION) {
                yield emailService.sendConversionEmail(email, id, apkg);
            }
        });
    }
}
exports.NotifyUserUseCase = NotifyUserUseCase;
//# sourceMappingURL=NotifyUserUseCase.js.map