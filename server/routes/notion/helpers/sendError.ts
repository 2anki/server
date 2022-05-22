import { Response } from 'express';

import { APIResponseError } from '@notionhq/client/build/src';

export default function sendError(
  error: Error | APIResponseError | unknown,
  response: Response
) {
  if (error instanceof APIResponseError) {
    return response
      .status(error.status)
      .json({ message: error.message })
      .send();
  }
  /* @ts-ignore */
  return response.status(500).json({ message: error?.message }).send();
}
