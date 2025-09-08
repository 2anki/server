"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.useDefaultEmailService = exports.UnimplementedEmailService = void 0;
const sgMail = require("@sendgrid/mail");
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const constants_1 = require("./constants");
const format_1 = require("../../lib/anki/format");
const constants_2 = require("../../lib/constants");
class EmailService {
    constructor(apiKey, defaultSender) {
        this.defaultSender = defaultSender;
        sgMail.setApiKey(apiKey);
    }
    sendResetEmail(email, token) {
        const link = `${process.env.DOMAIN}/users/r/${token}`;
        const markup = constants_1.PASSWORD_RESET_TEMPLATE.replace('{{link}}', link);
        const msg = {
            to: email,
            from: this.defaultSender,
            subject: 'Reset your 2anki.net password',
            text: `We received your password change request, you can change it here ${link}`,
            html: markup,
            replyTo: 'support@2anki.net',
        };
        sgMail.send(msg);
    }
    sendConversionEmail(email, filename, contents) {
        const markup = constants_1.CONVERT_TEMPLATE;
        let attachedFilename = filename;
        if (!(0, format_1.isValidDeckName)(filename)) {
            attachedFilename = (0, format_1.addDeckNameSuffix)(filename);
        }
        const msg = {
            to: email,
            from: constants_1.DEFAULT_SENDER,
            subject: `2anki.net - Your «${filename}» deck is ready`,
            text: 'Attached is your deck',
            html: markup,
            replyTo: 'support@2anki.net',
            attachments: [
                {
                    content: contents.toString('base64'),
                    filename: attachedFilename,
                    type: 'application/apkg',
                    disposition: 'attachment',
                },
            ],
        };
        return sgMail.send(msg);
    }
    sendConversionLinkEmail(email, filename, link) {
        return __awaiter(this, void 0, void 0, function* () {
            const markup = constants_1.CONVERT_LINK_TEMPLATE.replace(/{{link}}/g, link);
            const msg = {
                to: email,
                from: constants_1.DEFAULT_SENDER,
                subject: `2anki.net - Your «${filename}» deck is ready`,
                text: `Download your deck here: ${link}`,
                html: markup,
                replyTo: 'support@2anki.net',
            };
            yield sgMail.send(msg);
        });
    }
    sendContactEmail(name, email, message, attachments) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = {
                to: constants_2.SUPPORT_EMAIL_ADDRESS,
                from: constants_1.DEFAULT_SENDER,
                subject: `Contact form submission on behalf of ${name !== null && name !== void 0 ? name : 'Anon'} <${email}>`,
                text: `Message: ${message}\n\n`,
                attachments: attachments.map((file) => ({
                    content: file.buffer.toString('base64'),
                    filename: file.originalname,
                    type: file.mimetype,
                    disposition: 'attachment',
                })),
            };
            try {
                yield sgMail.send(msg);
                return { didSend: true };
            }
            catch (e) {
                console.error('Error sending email', e);
                return { didSend: false, error: e };
            }
        });
    }
    loadVatNotificationsSent() {
        try {
            // Ensure .2anki directory exists
            const dir = path.dirname(constants_1.VAT_NOTIFICATIONS_LOG_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (fs.existsSync(constants_1.VAT_NOTIFICATIONS_LOG_PATH)) {
                const data = fs.readFileSync(constants_1.VAT_NOTIFICATIONS_LOG_PATH, 'utf8');
                return new Set(JSON.parse(data));
            }
        }
        catch (error) {
            console.warn('Error loading VAT notifications log:', error);
        }
        return new Set();
    }
    saveVatNotificationSent(email) {
        try {
            const vatNotificationsSent = this.loadVatNotificationsSent();
            vatNotificationsSent.add(email);
            fs.writeFileSync(constants_1.VAT_NOTIFICATIONS_LOG_PATH, JSON.stringify([...vatNotificationsSent]));
        }
        catch (error) {
            console.error('Error saving VAT notification log:', error);
        }
    }
    sendVatNotificationEmail(email, currency, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const vatNotificationsSent = this.loadVatNotificationsSent();
            if (vatNotificationsSent.has(email)) {
                console.log(`Skipping ${email} - VAT notification already sent`);
                return;
            }
            const amount = currency === 'eur' ? '€2' : '$2';
            const markup = constants_1.VAT_NOTIFICATION_TEMPLATE.replace('{{amount}}', amount).replace('{{name}}', name || 'there');
            // Convert HTML to text using cheerio
            const $ = cheerio.load(markup);
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            const msg = {
                to: email,
                from: this.defaultSender,
                subject: '2anki.net - Upcoming Changes to VAT',
                text,
                html: markup,
                replyTo: 'support@2anki.net',
            };
            try {
                yield sgMail.send(msg);
                this.saveVatNotificationSent(email);
                console.log(`Successfully sent VAT notification to ${email}`);
            }
            catch (error) {
                console.error(`Failed to send VAT notification to ${email}:`, error);
                throw error;
            }
        });
    }
    loadCancellationsSent() {
        try {
            // Ensure .2anki directory exists
            const dir = path.dirname(constants_1.SUBSCRIPTION_CANCELLATIONS_LOG_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (fs.existsSync(constants_1.SUBSCRIPTION_CANCELLATIONS_LOG_PATH)) {
                const data = fs.readFileSync(constants_1.SUBSCRIPTION_CANCELLATIONS_LOG_PATH, 'utf8');
                return new Set(JSON.parse(data));
            }
        }
        catch (error) {
            console.warn('Error loading cancellations log:', error);
        }
        return new Set();
    }
    saveCancellationSent(subscriptionId) {
        try {
            const cancellationsSent = this.loadCancellationsSent();
            cancellationsSent.add(subscriptionId);
            fs.writeFileSync(constants_1.SUBSCRIPTION_CANCELLATIONS_LOG_PATH, JSON.stringify([...cancellationsSent]));
        }
        catch (error) {
            console.error('Error saving cancellation log:', error);
        }
    }
    sendSubscriptionCancelledEmail(email, name, subscriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cancellationsSent = this.loadCancellationsSent();
            if (cancellationsSent.has(subscriptionId)) {
                console.log(`Skipping ${email} - Cancellation notification already sent for subscription ${subscriptionId}`);
                return;
            }
            const markup = constants_1.SUBSCRIPTION_CANCELLED_TEMPLATE.replace('{{name}}', name || 'there');
            const $ = cheerio.load(markup);
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            const msg = {
                to: email,
                from: this.defaultSender,
                subject: '2anki.net - Subscription Cancelled',
                text,
                html: markup,
                replyTo: 'support@2anki.net',
            };
            try {
                yield sgMail.send(msg);
                this.saveCancellationSent(subscriptionId);
                console.log(`Successfully sent cancellation confirmation to ${email}`);
            }
            catch (error) {
                console.error(`Failed to send cancellation confirmation to ${email}:`, error);
                throw error;
            }
        });
    }
    sendSubscriptionScheduledCancellationEmail(email, name, cancelDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattedDate = cancelDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const markup = constants_1.SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE.replace('{{name}}', name || 'there').replace(/{{cancelDate}}/g, formattedDate);
            const $ = cheerio.load(markup);
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            const msg = {
                to: email,
                from: this.defaultSender,
                subject: '2anki.net - Subscription Cancellation Scheduled',
                text,
                html: markup,
                replyTo: 'support@2anki.net',
            };
            try {
                yield sgMail.send(msg);
                console.log(`Successfully sent scheduled cancellation notification to ${email}`);
            }
            catch (error) {
                console.error(`Failed to send scheduled cancellation notification to ${email}:`, error);
                throw error;
            }
        });
    }
}
class UnimplementedEmailService {
    sendResetEmail(email, token) {
        console.info('sendResetEmail not handled', email, token);
    }
    sendConversionEmail(email, filename, contents) {
        console.info('sendConversionEmail not handled', email, filename, contents);
    }
    sendConversionLinkEmail(email, filename, link) {
        console.info('sendConversionLinkEmail not handled', email, filename, link);
    }
    sendContactEmail(name, email, message, attachments) {
        console.info('sendContactEmail not handled', name, email, message, attachments);
        return Promise.resolve({ didSend: false });
    }
    sendVatNotificationEmail(email, currency, name) {
        console.info('sendVatNotificationEmail not handled', email, currency, name);
        return Promise.resolve();
    }
    sendSubscriptionCancelledEmail(email, name, subscriptionId) {
        console.info('sendSubscriptionCancelledEmail not handled', email, name, subscriptionId);
        return Promise.resolve();
    }
    sendSubscriptionScheduledCancellationEmail(email, name, cancelDate) {
        console.info('sendSubscriptionScheduledCancellationEmail not handled', email, name, cancelDate);
        return Promise.resolve();
    }
}
exports.UnimplementedEmailService = UnimplementedEmailService;
const useDefaultEmailService = () => {
    if (process.env.SENDGRID_API_KEY !== undefined) {
        return new EmailService(process.env.SENDGRID_API_KEY, constants_1.DEFAULT_SENDER);
    }
    return new UnimplementedEmailService();
};
exports.useDefaultEmailService = useDefaultEmailService;
//# sourceMappingURL=EmailService.js.map