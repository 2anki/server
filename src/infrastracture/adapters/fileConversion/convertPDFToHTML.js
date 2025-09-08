"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultUserInstructions = exports.convertPDFToHTML = void 0;
const contentGenerationUtils_1 = require("./contentGenerationUtils");
const SYSTEM_INSTRUCTIONS = `
Create an HTML file with questions and answers formatted as follows:
1. For each question and answer, use a <ul> tag with the CSS class <<<toggle>>>
2. Inside this <ul>, include a <li> tag with the details
3. The <details> tag should contain a <summary> tag for the question and the remaining lines for the answer
4. Use the same style as Notion for the HTML
5. Preserve all original formatting and structure from the PDF
6. Maintain proper HTML syntax and nesting
7. Ensure each question-answer pair is properly closed and formatted

Technical requirements:
- Each question-answer pair must be in its own <ul> element
- The CSS class <<<toggle>>> must be preserved exactly as shown
- The HTML structure must match Notion's toggle block format
- All content must be properly escaped for HTML
- Maintain proper indentation and formatting
`;
const DEFAULT_PDF_TO_HTML_INSTRUCTIONS = `
Some extra rules and explanations:
- Read the document from start to finish and identify any question and answers. 
- Use the same language as the document or infer the language based on what is mostly used.
- Use the same text as in the document and do not make up any questions or answers.
- Cite the document as source for the text.
- Be complete by finding all of the questions and answer in the document.
- Do not limit the number of number of questions and answer but create all of them!
- Do not make up any questions and use the questions in the document!
- Create a ul for every question pair, not one ul for all of them with li!
`;
const convertPDFToHTML = (pdf, userInstructions) => {
    const document1 = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdf,
        },
    };
    const req = {
        contents: [
            {
                role: 'user',
                parts: [
                    { text: SYSTEM_INSTRUCTIONS },
                    { text: userInstructions !== null && userInstructions !== void 0 ? userInstructions : DEFAULT_PDF_TO_HTML_INSTRUCTIONS },
                    document1,
                ],
            },
        ],
    };
    return (0, contentGenerationUtils_1.generateContent)(req);
};
exports.convertPDFToHTML = convertPDFToHTML;
const getDefaultUserInstructions = () => {
    return DEFAULT_PDF_TO_HTML_INSTRUCTIONS;
};
exports.getDefaultUserInstructions = getDefaultUserInstructions;
//# sourceMappingURL=convertPDFToHTML.js.map