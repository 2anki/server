import path from 'path';
import fs from 'fs';
import { GenerateContentRequest } from '@google-cloud/vertexai';
import { generateContent } from './contentGenerationUtils';

export const convertPDFToHTML = (pdf: string): Promise<string> => {
  const document1 = {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdf,
    },
  };

  const text1 = {
    text: fs
      .readFileSync(
        path.join(
          __dirname,
          '../../../../../../pdf-to-html-api',
          'instructions.txt'
        )
      )
      .toString(),
  };

  const req: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [document1, text1] }],
  };

  return generateContent(req);
};
