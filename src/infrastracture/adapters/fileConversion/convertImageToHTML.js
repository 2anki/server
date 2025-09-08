"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertImageToHTML = void 0;
exports.removeFirstAndLastLine = removeFirstAndLastLine;
const contentGenerationUtils_1 = require("./contentGenerationUtils");
/**
 * Google VertexAI is returning Markdown:
 * ```html
 * [...]
 * ```
 * So we need to remove the first and last line
 */
function removeFirstAndLastLine(content) {
    const lines = content.split('\n');
    return lines.slice(1, -1).join('\n');
}
const convertImageToHTML = (imageData) => __awaiter(void 0, void 0, void 0, function* () {
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
    const htmlContent = yield (0, contentGenerationUtils_1.generateContent)(req);
    return removeFirstAndLastLine(htmlContent);
});
exports.convertImageToHTML = convertImageToHTML;
//# sourceMappingURL=convertImageToHTML.js.map