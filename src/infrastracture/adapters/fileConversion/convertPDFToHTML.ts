import { GenerateContentRequest } from '@google-cloud/vertexai';
import { generateContent } from './contentGenerationUtils';

const DEFAULT_PDF_TO_HTML_INSTRUCTIONS = `Create an HTML file with questions and answers formatted as follows: For each question and answer, use a <ul> tag with the CSS class <<<toggle>>>. Inside this <ul>, include a <li> tag with the details. The <details> tag should contain a <summary> tag for the question and the remaining lines for the answer. Use the same style as Notion for the HTML.

Some extra rules and explanations:
- Read the document from start to finish and identify any question and answers. 
- Use the same language as the document or infer the language based on what is mostly used.
- Use the same text as in the document and do not make up any questions or answers.
- Cite the document as source for the text.
- Be complete by finding all of the questions and answer in the document.
- Do not limit the number of number of questions and answer but create all of them!
- Do not make up any questions and use the questions in the document!
- Create a ul for every question pair, not one ul for all of them with li!`;

export const convertPDFToHTML = (pdf: string): Promise<string> => {
  const document1 = {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdf,
    },
  };

  const text1 = {
    text: DEFAULT_PDF_TO_HTML_INSTRUCTIONS,
  };

  const req: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [document1, text1] }],
  };

  return generateContent(req);
};

export const convertPDFToHTMLWithInstructions = (
  pdf: string
): Promise<string> => {
  const document1 = {
    inlineData: {
      mimeType: 'application/pdf',
      data: pdf,
    },
  };

  const text1 = {
    text: DEFAULT_PDF_TO_HTML_INSTRUCTIONS,
  };

  const req: GenerateContentRequest = {
    contents: [{ role: 'user', parts: [document1, text1] }],
  };

  return generateContent(req);
};

export const getDefaultUserInstructions = (): string => {
  return DEFAULT_PDF_TO_HTML_INSTRUCTIONS;
};