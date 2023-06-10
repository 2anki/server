import express from 'express';

export class ChecksController {
  getStatusCheck(_req: express.Request, res: express.Response) {
    return res.status(200).send('2anki.net');
  }
}
