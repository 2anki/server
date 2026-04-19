import express from 'express';
import { APIErrorCode, APIResponseError } from '@notionhq/client';
import NotionController from './NotionController';
import NotionService from '../services/NotionService';

describe('NotionController', () => {
  let service: NotionService;
  let controller: NotionController;
  let req: Partial<express.Request>;
  let res: Partial<express.Response>;

  const pageId = '363e39e6-3d46-4414-9af9-0fccf8c8d913';

  const buildApi = (overrides: Record<string, unknown> = {}) =>
    ({
      listBlocksPage: jest.fn().mockResolvedValue({
        results: [],
        next_cursor: null,
        has_more: false,
      }),
      getPage: jest.fn().mockResolvedValue(null),
      ...overrides,
    }) as any;

  beforeEach(() => {
    service = {
      getNotionAPI: jest.fn(),
    } as any;
    controller = new NotionController(service);
    req = {
      params: { id: pageId },
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      locals: { owner: 'owner1' },
    } as any;
  });

  it('returns blocks even when id refers to a block instead of a page', async () => {
    const validationError = new APIResponseError({
      code: APIErrorCode.ValidationError,
      message: `Provided ID ${pageId} is a block, not a page. Use the retrieve block API instead`,
      status: 400,
      rawBodyText: '',
      headers: {},
    } as any);

    const api = buildApi({
      listBlocksPage: jest.fn().mockResolvedValue({
        results: [],
        next_cursor: null,
        has_more: false,
      }),
      getPage: jest.fn().mockRejectedValue(validationError),
    });
    (service.getNotionAPI as jest.Mock).mockResolvedValue(api);

    await controller.previewPage(
      req as express.Request,
      res as express.Response
    );

    expect(res.json).toHaveBeenCalledWith({
      blocks: [],
      nextCursor: null,
      hasMore: false,
    });
    expect(res.status).not.toHaveBeenCalledWith(400);
    expect(res.status).not.toHaveBeenCalledWith(500);
  });

  it('skips getPage entirely when parent=block is passed', async () => {
    const getPage = jest.fn();
    const api = buildApi({ getPage });
    (service.getNotionAPI as jest.Mock).mockResolvedValue(api);
    req.query = { parent: 'block' };

    await controller.previewPage(
      req as express.Request,
      res as express.Response
    );

    expect(getPage).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('includes page title when id refers to a real page', async () => {
    const api = buildApi({
      getPage: jest.fn().mockResolvedValue({
        object: 'page',
        id: pageId,
        parent: { type: 'workspace', workspace: true },
        properties: {
          title: {
            id: 'title',
            type: 'title',
            title: [
              {
                type: 'text',
                plain_text: 'My Page',
                text: { content: 'My Page', link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: 'default',
                },
                href: null,
              },
            ],
          },
        },
        url: 'https://notion.so/My-Page',
        created_time: '',
        last_edited_time: '',
        created_by: { id: 'u', object: 'user' },
        last_edited_by: { id: 'u', object: 'user' },
        cover: null,
        icon: null,
        archived: false,
        in_trash: false,
      }),
    });
    (service.getNotionAPI as jest.Mock).mockResolvedValue(api);

    await controller.previewPage(
      req as express.Request,
      res as express.Response
    );

    const payload = (res.json as jest.Mock).mock.calls[0]?.[0];
    expect(payload.pageTitle).toBe('My Page');
    expect(payload.pageUrl).toBe('https://notion.so/My-Page');
  });
});
