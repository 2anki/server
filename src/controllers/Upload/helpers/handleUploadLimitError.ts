import express from 'express';

const RATE_LMIT = 429;

export const handleUploadLimitError = (
  _req: express.Request,
  response: express.Response
) => {
  response.status(RATE_LMIT).json({
    error:
      'Upload limit of 100 flashcards exceeded, become premium to remove limit or reduce upload size.',
  });
};
