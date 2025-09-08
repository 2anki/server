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
const addHeadings_1 = __importDefault(require("./helpers/addHeadings"));
class ParserRules {
    constructor() {
        this.FLASHCARD = ['toggle'];
        this.DECK = ['page', 'database'];
        this.SUB_DECKS = ['child_page'];
        this.TAGS = 'strikethrough';
        this.UNLIMITED = false;
        this.EMAIL_NOTIFICATION = false;
    }
    /**
     *  Function to handle transforming flaschard types to proper names for use in traversal
     * @returns all type names for flashcards
     */
    flaschardTypeNames() {
        let names = this.FLASHCARD;
        names = (0, addHeadings_1.default)(names);
        return names;
    }
    /**
     * Setter for the types to prevent direct access
     * @param types string[]
     */
    setFlashcardTypes(types) {
        this.FLASHCARD = types;
    }
    /**
     *  return the flashcard types
     * @returns string[]
     */
    flashcardTypes() {
        return this.FLASHCARD;
    }
    static Load(owner, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const rules = new ParserRules();
            try {
                const result = yield (0, data_layer_1.getDatabase)()('parser_rules')
                    .where({ object_id: id, owner })
                    .returning(['*'])
                    .first();
                if (result) {
                    rules.setFlashcardTypes(result.flashcard_is.split(','));
                    rules.DECK = result.deck_is;
                    rules.SUB_DECKS = result.sub_deck_is;
                    rules.TAGS = result.tags_is;
                    rules.EMAIL_NOTIFICATION = result.email_notification;
                }
                else {
                    console.info(`No parser rules found for object_id: ${id} and owner: ${owner}. Using default values.`);
                }
                return rules;
            }
            catch (error) {
                console.error(error);
            }
            return new ParserRules();
        });
    }
    useColums() {
        return this.FLASHCARD.includes('column_list');
    }
    permitsDeckAsPage() {
        return this.DECK.includes('page');
    }
}
exports.default = ParserRules;
//# sourceMappingURL=ParserRules.js.map