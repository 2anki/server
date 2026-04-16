import express from 'express';
import RulesController from './ParserRulesController';
import ParserRulesService from '../services/ParserRulesService';
import * as getOwnerModule from '../lib/User/getOwner';

describe('ParserRulesController', () => {
  let service: ParserRulesService;
  let controller: RulesController;
  let req: Partial<express.Request>;
  let res: Partial<express.Response>;

  beforeEach(() => {
    service = {
      createRule: jest.fn(),
      getById: jest.fn(),
    } as any;
    controller = new RulesController(service);
    req = {
      params: { id: '7ccef4f6-b50c-4599-878e-f6fb61415ce2' },
      body: { payload: { FLASHCARD: 'a', DECK: 'b' } },
    };
    res = {
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(getOwnerModule, 'getOwner').mockReturnValue('owner1');
  });

  it('does not leak database driver internals when creating a rule', async () => {
    const pgResultLikeObject = {
      command: 'INSERT',
      rowCount: 1,
      rows: [],
      fields: [],
      _types: { builtins: { BOOL: 16 } },
      RowCtor: null,
      rowAsArray: false,
    };
    (service.createRule as jest.Mock).mockResolvedValue(pgResultLikeObject);

    await controller.createRule(
      req as express.Request,
      res as express.Response
    );

    expect(res.status).toHaveBeenCalledWith(201);
    const sentBody = (res.send as jest.Mock).mock.calls[0]?.[0];
    const sentJson = (res.json as jest.Mock).mock.calls[0]?.[0];
    const payload = sentBody ?? sentJson;
    const serialized = JSON.stringify(payload ?? '');
    expect(serialized).not.toContain('_types');
    expect(serialized).not.toContain('RowCtor');
    expect(serialized).not.toContain('rowAsArray');
    expect(serialized).not.toContain('command');
  });

  it('returns 400 when id is missing', async () => {
    req.params = {};
    await controller.createRule(
      req as express.Request,
      res as express.Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when service throws', async () => {
    (service.createRule as jest.Mock).mockRejectedValue(new Error('fail'));
    await controller.createRule(
      req as express.Request,
      res as express.Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
