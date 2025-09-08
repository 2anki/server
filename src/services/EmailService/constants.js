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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE = exports.SUBSCRIPTION_CANCELLATIONS_LOG_PATH = exports.SUBSCRIPTION_CANCELLED_TEMPLATE = exports.VAT_NOTIFICATIONS_LOG_PATH = exports.VAT_NOTIFICATION_TEMPLATE = exports.DEFAULT_SENDER = exports.CONVERT_LINK_TEMPLATE = exports.CONVERT_TEMPLATE = exports.PASSWORD_RESET_TEMPLATE = exports.EMAIL_TEMPLATES_DIRECTORY = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os = __importStar(require("os"));
exports.EMAIL_TEMPLATES_DIRECTORY = path_1.default.join(__dirname, 'templates');
exports.PASSWORD_RESET_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'reset.html'), 'utf8');
exports.CONVERT_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'convert.html'), 'utf8');
exports.CONVERT_LINK_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'convert-link.html'), 'utf8');
exports.DEFAULT_SENDER = '2anki.net <info@2anki.net>';
exports.VAT_NOTIFICATION_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'vat-notification.html'), 'utf8');
exports.VAT_NOTIFICATIONS_LOG_PATH = path_1.default.join(os.homedir(), '.2anki', 'vat-notifications-sent.json');
exports.SUBSCRIPTION_CANCELLED_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'subscription-cancelled.html'), 'utf8');
exports.SUBSCRIPTION_CANCELLATIONS_LOG_PATH = path_1.default.join(os.homedir(), '.2anki', 'subscriptions-cancelled-sent.json');
exports.SUBSCRIPTION_SCHEDULED_CANCELLATION_TEMPLATE = fs_1.default.readFileSync(path_1.default.join(exports.EMAIL_TEMPLATES_DIRECTORY, 'subscription-scheduled-cancellation.html'), 'utf8');
//# sourceMappingURL=constants.js.map