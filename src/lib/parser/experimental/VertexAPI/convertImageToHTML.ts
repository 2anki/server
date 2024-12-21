import { VertexAI } from '@google-cloud/vertexai';
import { SAFETY_SETTINGS } from './constants';
import { removeFirstAndLastLine } from './removeFirstAndLastLine';

export const convertImageToHTML = async (
  imageData: string
): Promise<string> => {
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

  const text1 = {
    text: `Convert the text in this image to the following format for (every question is their own ul):

        <ul class=\"toggle\">
          <li>
           <details>
            <summary>
                n) question
            </summary>
        <p>A) ..., </p>
        <p>B)... </p>
        etc. 
        <p>and finally Answer: D</p>
           </details>
          </li>
          </ul>

        —
        - Extra rules: n=is the number for the question, question=the question text
    - Add newline between the options
    - If you are not able to detect the pattern above, try converting this into a question and answer format`,
  };

  const image1 = {
    inlineData: {
      mimeType: 'image/png',
      data: imageData,
    },
  };

  const req = {
    contents: [{ role: 'user', parts: [text1, image1] }],
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
  }
  htmlContent = removeFirstAndLastLine(htmlContent);

  return htmlContent;
};
