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
exports.BuildDeckForJobUseCase = void 0;
const CardGenerator_1 = __importDefault(require("../../lib/anki/CardGenerator"));
const fs_1 = __importDefault(require("fs"));
const deckNameToText_1 = require("../../services/NotionService/BlockHandler/helpers/deckNameToText");
const format_1 = require("../../lib/anki/format");
const file_1 = require("../../lib/misc/file");
const data_layer_1 = require("../../data_layer");
class BuildDeckForJobUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    execute(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bl, exporter, decks, ws, settings, storage, id, owner } = input;
            // Filter out decks with no cards
            const filteredDecks = decks.filter((deck) => deck.cards && deck.cards.length > 0);
            exporter.configure(filteredDecks);
            const gen = new CardGenerator_1.default(ws.location);
            const payload = (yield gen.run());
            const apkg = fs_1.default.readFileSync(payload);
            const filename = (0, deckNameToText_1.toText)((() => {
                const f = settings.deckName || bl.firstPageTitle || id;
                if ((0, format_1.isValidDeckName)(f)) {
                    return f;
                }
                return (0, format_1.addDeckNameSuffix)(f);
            })());
            const key = storage.uniqify(id, owner, 200, format_1.DECK_NAME_SUFFIX);
            yield storage.uploadFile(key, apkg);
            const size = (0, file_1.FileSizeInMegaBytes)(payload);
            yield (0, data_layer_1.getDatabase)()('uploads').insert({
                object_id: id,
                owner,
                filename,
                key,
                size_mb: size,
            });
            return { size, key, apkg };
        });
    }
}
exports.BuildDeckForJobUseCase = BuildDeckForJobUseCase;
//# sourceMappingURL=BuildDeckForJobUseCase.js.map