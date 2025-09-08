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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorHandler;
const nodemailer_1 = __importDefault(require("nodemailer"));
const isLimitError_1 = require("../../lib/misc/isLimitError");
const isEmptyPayload_1 = require("../../lib/misc/isEmptyPayload");
const preserveFilesForDebugging_1 = require("../../lib/debug/preserveFilesForDebugging");
const cheerio = __importStar(require("cheerio"));
const transporter = nodemailer_1.default.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail',
});
function sendErrorEmail(error, req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (process.env.NODE_ENV !== 'production')
            return;
        const $ = cheerio.load(error.message);
        const plainTextMessage = $.root().text();
        const subject = `[ERROR] [2anki.net] - ${plainTextMessage}`;
        const message = {
            from: (_a = process.env.ERROR_SENDER_EMAIL) !== null && _a !== void 0 ? _a : 'noreply@zoe.2anki.net',
            to: (_b = process.env.ERROR_RECEIVER_EMAIL) !== null && _b !== void 0 ? _b : 'alexander@alemayhu.com',
            subject,
            text: `
${error.stack}

Request path: ${req.path}
Method: ${req.method}
Query: ${JSON.stringify(req.query)}
Body: ${JSON.stringify(req.body)}
`,
        };
        try {
            yield transporter.sendMail(message);
        }
        catch (emailErr) {
            console.error('Failed to send error email:', emailErr);
        }
    });
}
function ErrorHandler(res, req, err) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadedFiles = req.files;
        const skipError = (0, isLimitError_1.isLimitError)(err);
        if (!skipError) {
            console.info('Send error');
            console.error(err);
            if (!(0, isEmptyPayload_1.isEmptyPayload)(uploadedFiles)) {
                (0, preserveFilesForDebugging_1.preserveFilesForDebugging)(req, uploadedFiles, err);
            }
            try {
                yield sendErrorEmail(err, req);
            }
            catch (emailErr) {
                console.error('Failed to send error email:', emailErr);
            }
        }
        else {
            console.info('User no limit reached');
        }
        res.set('Content-Type', 'text/plain');
        res.status(400).send(err.message);
    });
}
//# sourceMappingURL=ErrorHandler.js.map