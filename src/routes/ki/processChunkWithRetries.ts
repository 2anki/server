import { Response } from 'express';
import { sendChunkToAI } from './sendChunkToAI';
import { handleRetryError } from './handleRetryError';
import { GenerativeModel } from '@google/generative-ai';

export async function processChunkWithRetries(
  chunk: string,
  index: number,
  totalChunks: number,
  name: string,
  chatSession: ReturnType<GenerativeModel['startChat']>,
  res: Response,
  sendStatus: (message: string) => void
) {
  let retries = 3;
  while (retries > 0) {
    try {
      const chunkContent = `File: ${name} (Part ${index + 1}/${totalChunks})\n\n${chunk}`;
      await sendChunkToAI(
        chunkContent,
        index,
        totalChunks,
        name,
        chatSession,
        res,
        sendStatus
      );
      break;
    } catch (error: any) {
      retries--;
      await handleRetryError(error, retries, sendStatus);
    }
  }
}
