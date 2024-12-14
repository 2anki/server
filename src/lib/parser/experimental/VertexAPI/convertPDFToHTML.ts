import path from 'path';
import fs from 'fs';

import { GenerateContentRequest, VertexAI } from '@google-cloud/vertexai';
import { SAFETY_SETTINGS } from './constants';

export const convertPDFToHTML = async (pdf: string): Promise<string> => {
  const vertexAI = new VertexAI({
    project: 'notion-to-anki',
    location: 'europe-west3',
  });
  const model = 'gemini-1.5-pro-002';
  const generativeModel = vertexAI.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
    safetySettings: SAFETY_SETTINGS,
  });

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

  let htmlContent = '';
  try {
    const streamingResp = await generativeModel.generateContentStream(req);
    for await (const item of streamingResp.stream) {
      if (
        item.candidates &&
        item.candidates[0].content &&
        item.candidates[0].content.parts
      ) {
        htmlContent += item.candidates[0].content.parts
          .map((part) => part.text)
          .join('');
      }
    }
  } catch (error) {
    console.error('Error generating content stream:', error);

    // const workSpace = process.cwd();
    // const outputPath = path.join(workSpace, 'output.html');
    // fs.writeFileSync(outputPath, htmlContent);
    // console.log(outputPath);
  }
  return htmlContent;
};
