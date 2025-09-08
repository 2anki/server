"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEADING_MOCK = exports.CHILD_PAGE_MOCK = void 0;
exports.CHILD_PAGE_MOCK = {
    object: 'block',
    id: '3cc8d7cc-358a-46b4-a03a-1b18ff4f2d35',
    parent: {
        type: 'page_id',
        page_id: 'd693054c-328f-404a-9267-d78681a75bef',
    },
    created_time: '2021-10-24T08:05:00.000Z',
    last_edited_time: '2022-04-23T17:11:00.000Z',
    created_by: {
        object: 'user',
        id: '1590db54-99fe-467c-a656-be319fe6ca8b',
    },
    last_edited_by: {
        object: 'user',
        id: '1590db54-99fe-467c-a656-be319fe6ca8b',
    },
    has_children: true,
    archived: false,
    type: 'child_page',
    child_page: {
        title: 'Basic blocks',
    },
};
exports.HEADING_MOCK = {
    object: 'block',
    id: '02f65a53-c1af-405f-8ba9-fa9cf6933113',
    parent: {
        type: 'page_id',
        page_id: 'd693054c-328f-404a-9267-d78681a75bef',
    },
    created_time: '2021-03-20T12:54:00.000Z',
    last_edited_time: '2021-03-20T12:55:00.000Z',
    created_by: {
        object: 'user',
        id: '1590db54-99fe-467c-a656-be319fe6ca8b',
    },
    last_edited_by: {
        object: 'user',
        id: '1590db54-99fe-467c-a656-be319fe6ca8b',
    },
    has_children: false,
    archived: false,
    type: 'heading_2',
    heading_2: {
        is_toggleable: true,
        rich_text: [
            {
                type: 'text',
                text: {
                    content: 'Blocks',
                    link: null,
                },
                annotations: {
                    bold: false,
                    italic: false,
                    strikethrough: false,
                    underline: false,
                    code: false,
                    color: 'default',
                },
                plain_text: 'Blocks',
                href: null,
            },
        ],
        color: 'default',
    },
};
//# sourceMappingURL=mocks.js.map