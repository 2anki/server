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
exports.loadSettingsFromDatabase = void 0;
const getCustomTemplate_1 = require("./helpers/getCustomTemplate");
const CardOption_1 = __importDefault(require("./CardOption"));
const loadSettingsFromDatabase = (DB, owner, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield DB('settings')
            .where({ object_id: id, owner })
            .returning(['payload'])
            .first();
        if (!result) {
            console.log('using default settings');
            return new CardOption_1.default(CardOption_1.default.LoadDefaultOptions());
        }
        const settings = new CardOption_1.default(result.payload.payload);
        const templates = yield DB('templates')
            .where({ owner: owner })
            .returning(['payload'])
            .first();
        if (templates && settings.template === 'custom') {
            settings.n2aBasic = (0, getCustomTemplate_1.getCustomTemplate)('n2a-basic', templates.payload);
            settings.n2aCloze = (0, getCustomTemplate_1.getCustomTemplate)('n2a-cloze', templates.payload);
            settings.n2aInput = (0, getCustomTemplate_1.getCustomTemplate)('n2a-input', templates.payload);
            if (settings.n2aBasic) {
                settings.n2aBasic.name = settings.basicModelName;
            }
            if (settings.n2aCloze) {
                settings.n2aCloze.name = settings.clozeModelName;
            }
            if (settings.n2aInput) {
                settings.n2aInput.name = settings.inputModelName;
            }
        }
        return settings;
    }
    catch (error) {
        console.info('Load settings from database failed');
        console.error(error);
    }
    return new CardOption_1.default(CardOption_1.default.LoadDefaultOptions());
});
exports.loadSettingsFromDatabase = loadSettingsFromDatabase;
//# sourceMappingURL=loadSettingsFromDatabase.js.map