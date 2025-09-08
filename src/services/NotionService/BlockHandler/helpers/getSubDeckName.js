"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@notionhq/client");
const getChildPageBlock_1 = require("../../blocks/helpers/getChildPageBlock");
const getToggleBlock_1 = require("../../blocks/helpers/getToggleBlock");
const richObjectToString_1 = require("../../blocks/helpers/richObjectToString");
const getHeading_1 = require("../../blocks/helpers/getHeading");
const getChildDatabaseBlock_1 = require("../../blocks/helpers/getChildDatabaseBlock");
const getSubDeckName = (block) => {
    let subDeckName = 'Untitled';
    if ('title' in block) {
        return block.title;
    }
    if ((0, client_1.isFullBlock)(block)) {
        switch (block.type) {
            case 'child_page':
                return (0, getChildPageBlock_1.getChildPageBlock)(block).title;
            case 'child_database':
                return (0, getChildDatabaseBlock_1.getChildDatabaseBlock)(block).title;
            case 'toggle':
                return (0, richObjectToString_1.richObjectToString)((0, getToggleBlock_1.getToggleBlock)(block));
            case 'heading_1':
            case 'heading_2':
            case 'heading_3':
                const heading = (0, getHeading_1.getHeading)(block);
                if (heading) {
                    return (0, richObjectToString_1.richObjectToString)(heading);
                }
            case 'column_list':
            case 'bulleted_list_item':
            case 'numbered_list_item':
                return subDeckName;
        }
    }
    return subDeckName;
};
exports.default = getSubDeckName;
//# sourceMappingURL=getSubDeckName.js.map