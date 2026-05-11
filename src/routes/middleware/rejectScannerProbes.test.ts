import { Request, Response, NextFunction } from 'express';
import rejectScannerProbes from './rejectScannerProbes';

function mockReqRes(method: string, path: string) {
  const req = { method, path } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    end: jest.fn(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe('rejectScannerProbes', () => {
  it.each([
    '/phpinfo.php',
    '/mysql/.env',
    '/admin/test.asp',
    '/old/config.bak',
    '/.htaccess',
    '/dump.sql',
  ])('returns 404 for %s', (path) => {
    const { req, res, next } = mockReqRes('GET', path);
    rejectScannerProbes(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it.each([
    '/login',
    '/downloads',
    '/notion-to-anki',
    '/api/users/me',
    '/assets/app.js',
    '/index.html',
  ])('passes through for %s', (path) => {
    const { req, res, next } = mockReqRes('GET', path);
    rejectScannerProbes(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('passes through POST requests even with probe extensions', () => {
    const { req, res, next } = mockReqRes('POST', '/test.php');
    rejectScannerProbes(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
