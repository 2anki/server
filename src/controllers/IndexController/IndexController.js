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
const data_layer_1 = require("../../data_layer");
const AuthenticationService_1 = __importDefault(require("../../services/AuthenticationService"));
const TokenRepository_1 = __importDefault(require("../../data_layer/TokenRepository"));
const UsersRepository_1 = __importDefault(require("../../data_layer/UsersRepository"));
const configureUserLocal_1 = require("../../routes/middleware/configureUserLocal");
const getIndexFileContents_1 = require("./getIndexFileContents");
class IndexController {
    getIndex(request, response) {
        const database = (0, data_layer_1.getDatabase)();
        const authService = new AuthenticationService_1.default(new TokenRepository_1.default(database), new UsersRepository_1.default(database));
        (0, configureUserLocal_1.configureUserLocal)(request, response, authService, database).then(() => {
            response.send((0, getIndexFileContents_1.getIndexFileContents)());
        });
    }
    contactUs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, message } = req.body;
            console.info('Contact Us', name, email, message);
            if (!email || !message) {
                return res.status(400).send({ error: 'Missing email or message' });
            }
            const attachments = req.files;
            const database = (0, data_layer_1.getDatabase)();
            yield database('feedback').insert({
                name,
                email,
                message,
                attachments: JSON.stringify(attachments.map((a) => a.path)),
            });
            return res.status(200).send();
        });
    }
}
exports.default = IndexController;
//# sourceMappingURL=IndexController.js.map