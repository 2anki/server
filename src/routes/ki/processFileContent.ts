import { Response } from 'express';
import { splitContentIntoChunks } from './splitContentIntoChunks';
import { processChunkWithRetries } from './processChunkWithRetries';
import { handleError } from './handleError';
import { GenerativeModel } from '@google/generative-ai';

// New function to process content
const processContent = async (
  content: string,
  name: string,
  chatSession: ReturnType<GenerativeModel['startChat']>,
  res: Response,
  sendStatus: (message: string) => void
) => {
  const contentSize = content.length;
  sendStatus(`[DEBUG] Content size: ${contentSize / (1024 * 1024)}MB`);

  const chunks = splitContentIntoChunks(content);
  sendStatus(`[DEBUG] Split content into ${chunks.length} chunks`);

  await Promise.all(
    chunks.map((chunk, i) =>
      processChunkWithRetries(
        chunk,
        i,
        chunks.length,
        name,
        chatSession,
        res,
        sendStatus
      )
    )
  );
};

export async function processFileContent(
  chatSession: ReturnType<GenerativeModel['startChat']>,
  content: string,
  name: string,
  res: Response
): Promise<void> {
  const timeLabel = `process-file-${name}`;
  console.time(timeLabel);

  const sendStatus = (message: string) => {
    console.log(message);
    res.write(`event: status\ndata: ${JSON.stringify({ message })}\n\n`);
    if (res.flush) res.flush();
  };

  try {
    await processContent(content, name, chatSession, res, sendStatus);
  } catch (error: any) {
    handleError(error, name, sendStatus);
  }

  console.timeEnd(timeLabel);
}
