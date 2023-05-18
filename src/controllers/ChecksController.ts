import express from 'express';

const getStatusCheck = (_req: express.Request, res: express.Response) =>
  res.status(200).send('2anki.net');

const ChecksController = { getStatusCheck };

export default ChecksController;
