import { Response } from 'express';
import { processChunk } from './processChunk';
import { GenerativeModel } from '@google/generative-ai';

export async function sendChunkToAI(
  chunkContent: string,
  index: number,
  totalChunks: number,
  name: string,
  chatSession: ReturnType<GenerativeModel['startChat']>,
  res: Response,
  sendStatus: (message: string) => void
) {
  const sizeMB = (chunkContent.length / (1024 * 1024)).toFixed(2);
  sendStatus(
    `[KI Request] Processing chunk ${index + 1}/${totalChunks} of ${name}, size: ${sizeMB}MB`
  );
  const fileResponse = await chatSession.sendMessage(chunkContent);
  const responseText = await fileResponse.response.text();
  console.log('[AI Response]', responseText);
  processChunk([], responseText, res);

  if (index < totalChunks - 1) {
    sendStatus(`[DEBUG] Waiting before processing next chunk...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
