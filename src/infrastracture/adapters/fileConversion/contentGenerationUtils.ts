import { GenerateContentRequest } from '@google-cloud/vertexai';
import { setupVertexAI } from './vertexAIUtils';

export async function generateContent(
  req: GenerateContentRequest
): Promise<string> {
  const generativeModel = setupVertexAI();
  let content = '';

  try {
    const streamingResp = await generativeModel.generateContentStream(req);
    for await (const item of streamingResp.stream) {
      if (
        item.candidates &&
        item.candidates[0].content &&
        item.candidates[0].content.parts
      ) {
        content += item.candidates[0].content.parts
          .map((part) => part.text)
          .join('');
      }
    }
  } catch (error) {
    console.error('Error generating content stream:', error);
  }

  return content;
}
