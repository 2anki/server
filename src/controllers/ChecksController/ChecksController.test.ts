import express from 'express';
import { ChecksController } from './ChecksController';

describe('ChecksController', () => {
  describe('getStatusCheck', () => {
    it('should return a 200 status code', () => {
      const req = {} as express.Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as express.Response;

      const checksController = new ChecksController();
      checksController.getStatusCheck(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith('2anki.net');
    });
  });
});
