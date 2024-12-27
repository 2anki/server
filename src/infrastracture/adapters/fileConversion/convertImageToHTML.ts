import { GenerateContentRequest } from '@google-cloud/vertexai';
import { generateContent } from './contentGenerationUtils';

/**
 * Google VertexAI is returning Markdown:
 * ```html
 * [...]
 * ```
 * So we need to remove the first and last line
 */
export function removeFirstAndLastLine(content: string): string {
  const lines = content.split('\n');
  return lines.slice(1, -1).join('\n');
}

export const convertImageToHTML = async (
  imageData: string
): Promise<string> => {
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

  const req: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [text1, image1] }],
  };

  const htmlContent = await generateContent(req);
  return removeFirstAndLastLine(htmlContent);
};
