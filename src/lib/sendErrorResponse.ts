import { Response } from 'express';

import { APIErrorCode, APIResponseError } from '@notionhq/client';

function isExpectedUserError(error: unknown): boolean {
  if (!(error instanceof APIResponseError)) return false;
  // Notion returning Unauthorized means the user revoked access or
  // the stored token expired — it's an expected outcome that triggers
  // a reconnect flow, not a server bug.
  return error.code === APIErrorCode.Unauthorized;
}

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

  if (isExpectedUserError(error)) {
    console.info(
      '[notion] expected user error',
      (error as APIResponseError).code
    );
  } else {
    console.error(error);
  }

  return response.status(status).json(body).send();
}
