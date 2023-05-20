import { Response } from 'express';

import { APIResponseError } from '@notionhq/client/build/src';

export default function sendErrorResponse(
  error: Error | APIResponseError | unknown,
  response: Response
) {
  let status = 500;
  let body = { message: 'Unknown error.' };
  if (error instanceof APIResponseError) {
    status = error.status;
    body = { message: error.message };
  }
  return response.status(status).json(body).send();
}
