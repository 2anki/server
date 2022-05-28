import { Response } from 'express';

import sendError from './sendError';

export default async function ensureResponse(
  call: () => Promise<void>,
  res: Response
): Promise<void> {
  try {
    await call();
  } catch (error) {
    sendError(error, res);
  }
}
