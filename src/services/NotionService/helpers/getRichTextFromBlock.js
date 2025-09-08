"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRichTextFromBlock = void 0;
const client_1 = require("@notionhq/client");
const getHeadingText_1 = require("./getHeadingText");
const getRichTextFromBlock = (block) => {
    if (!(0, client_1.isFullBlock)(block)) {
        return undefined;
    }
    switch (block.type) {
        case 'toggle':
            return block.toggle.rich_text;
        case 'bulleted_list_item':
            return block.bulleted_list_item
                .rich_text;
        case 'numbered_list_item':
            return block.numbered_list_item
                .rich_text;
        case 'heading_1':
        case 'heading_2':
        case 'heading_3':
            return (0, getHeadingText_1.getHeadingText)(block);
        case 'paragraph':
            return block.paragraph.rich_text;
        case 'quote':
            return block.quote.rich_text;
        case 'to_do':
            return block.to_do.rich_text;
        case 'template':
            return block.template.rich_text;
        case 'code':
            return block.code.rich_text;
        case 'callout':
            return block.callout.rich_text;
        default:
            return undefined;
    }
};
exports.getRichTextFromBlock = getRichTextFromBlock;
//# sourceMappingURL=getRichTextFromBlock.js.map