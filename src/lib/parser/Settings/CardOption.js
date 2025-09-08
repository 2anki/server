"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertPDFToHTML_1 = require("../../../infrastracture/adapters/fileConversion/convertPDFToHTML");
const parseTemplate_1 = require("./helpers/parseTemplate");
class CardOption {
    constructor(input) {
        var _a;
        this.deckName = input.deckName;
        if (this.deckName && !this.deckName.trim()) {
            this.deckName = undefined;
        }
        this.useInput = input['enable-input'] !== 'false';
        this.maxOne = input['max-one-toggle-per-card'] === 'true';
        this.noUnderline = input['no-underline'] === 'true';
        this.isCherry = input.cherry === 'true';
        this.isAvocado = input.avocado === 'true';
        this.isAll = input.all === 'true';
        this.fontSize = input['font-size'];
        this.isTextOnlyBack = input.paragraph === 'true';
        this.toggleMode = input['toggle-mode'] || 'close_toggle';
        this.isCloze = input.cloze !== 'false';
        this.useTags = input.tags !== 'false';
        this.basicReversed = input['basic-reversed'] === 'true';
        this.reversed = input.reversed === 'true';
        this.removeMP3Links = input['remove-mp3-links'] === 'true' || false;
        this.perserveNewLines = input['perserve-newlines'] === 'true' || false;
        this.clozeModelName = input.cloze_model_name || 'n2a-cloze';
        this.basicModelName = input.basic_model_name || 'n2a-basic';
        this.inputModelName = input.input_model_name || 'n2a-input';
        this.clozeModelId = input.cloze_model_id;
        this.basicModelId = input.basic_model_id;
        this.inputModelId = input.input_model_id;
        this.template = input.template;
        this.useNotionId = input['use-notion-id'] === 'true';
        this.parentBlockId = input.parentBlockId;
        this.pageEmoji = input['page-emoji'] || 'first_emoji';
        this.addNotionLink = input['add-notion-link'] === 'true';
        this.vertexAIPDFQuestions = input['vertex-ai-pdf-questions'] === 'true';
        this.disableIndentedBulletPoints =
            input['disable-indented-bullets'] === 'true';
        this.imageQuizHtmlToAnki = input['image-quiz-html-to-anki'] === 'true';
        this.processPDFs = input['process-pdfs'] !== 'false';
        /* Is this really needed? */
        if (this.parentBlockId) {
            this.addNotionLink = true;
        }
        this.nestedBulletPoints = input['markdown-nested-bullet-points'] === 'true';
        this.userInstructions =
            (_a = input['user-instructions']) !== null && _a !== void 0 ? _a : (0, convertPDFToHTML_1.getDefaultUserInstructions)();
        console.log('this.userInstructions', this.userInstructions);
        this.retrieveTemplates(input);
    }
    retrieveTemplates(input) {
        try {
            this.n2aBasic = (0, parseTemplate_1.parseTemplate)(input['n2a-basic']);
            this.n2aCloze = (0, parseTemplate_1.parseTemplate)(input['n2a-cloze']);
            this.n2aInput = (0, parseTemplate_1.parseTemplate)(input['n2a-input']);
        }
        catch (error) {
            console.info('Retrieve templates failed');
            console.error(error);
        }
    }
    /*
     * The default options for Notion integration differ with the ones in the HTML form.
     * To avoid regressions we have to keep the same defaults until a proper migration can be done.
     */
    static LoadDefaultOptions() {
        return {
            'add-notion-link': 'false',
            'use-notion-id': 'true',
            all: 'true',
            paragraph: 'false',
            cherry: 'false',
            avocado: 'false',
            tags: 'true',
            cloze: 'true',
            'enable-input': 'false',
            'basic-reversed': 'false',
            reversed: 'false',
            'no-underline': 'false',
            'max-one-toggle-per-card': 'true',
            'perserve-newlines': 'false',
            'process-pdfs': 'true',
            'page-emoji': 'first-emoji',
            'image-quiz-html-to-anki': 'false',
            'markdown-nested-bullet-points': 'true',
        };
    }
}
exports.default = CardOption;
//# sourceMappingURL=CardOption.js.map