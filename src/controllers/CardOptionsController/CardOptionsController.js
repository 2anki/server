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
const getOwner_1 = require("../../lib/User/getOwner");
const supportedOptions_1 = __importDefault(require("./supportedOptions"));
const CardOption_1 = __importDefault(require("../../lib/parser/Settings/CardOption"));
class CardOptionsController {
    constructor(service) {
        this.service = service;
    }
    createSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info(`/settings/create ${req.params.id}`);
            const { settings } = req.body;
            const owner = (0, getOwner_1.getOwner)(res);
            try {
                yield this.service.create({
                    owner: owner,
                    payload: settings,
                    object_id: settings.object_id,
                });
                res.status(200).send();
            }
            catch (error) {
                console.info('Create setting failed');
                console.error(error);
                res.status(400).send();
            }
        });
    }
    deleteSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const owner = (0, getOwner_1.getOwner)(res);
            const { id } = req.params;
            try {
                yield this.service.delete(owner, id);
                res.status(200).send();
            }
            catch (error) {
                console.info('Delete setting failed');
                console.error(error);
                res.status(400).send();
            }
        });
    }
    findSetting(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.debug(`find settings ${req.params.id}`);
            const { id } = req.params;
            if (!id) {
                return res.status(400).send();
            }
            try {
                const storedSettings = yield this.service.getById(id);
                return res.json({ payload: storedSettings });
            }
            catch (error) {
                console.info('Get setting failed');
                console.error(error);
                res.status(400).send();
            }
        });
    }
    getDefaultCardOptions(source) {
        if (source === 'client') {
            return this.getDefaultCardOptionDetails()
                .map((option) => {
                return { [option.key]: option.value.toString() };
            })
                .reduce((accumulator, current) => {
                return Object.assign(Object.assign({}, accumulator), current);
            }, {});
        }
        return CardOption_1.default.LoadDefaultOptions();
    }
    getDefaultCardOptionDetails() {
        return (0, supportedOptions_1.default)();
    }
}
exports.default = CardOptionsController;
//# sourceMappingURL=CardOptionsController.js.map