import { Response } from 'express';

import sendErrorResponse from './sendErrorResponse';

export default async function ensureResponse(
  call: () => Promise<any>,
  res: Response
): Promise<void> {
  try {
    await call();
  } catch (error) {
    console.error(error);
    sendErrorResponse(error, res);
  }
}
