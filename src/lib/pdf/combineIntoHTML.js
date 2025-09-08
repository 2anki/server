"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineIntoHTML = combineIntoHTML;
const path_1 = __importDefault(require("path"));
function combineIntoHTML(imagePaths, title) {
    const html = `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  ${Array.from({ length: imagePaths.length / 2 }, (_, i) => {
        const front = path_1.default.basename(imagePaths[i * 2]);
        const back = path_1.default.basename(imagePaths[i * 2 + 1]);
        return `<ul class="toggle">
    <li>
      <details>
        <summary>
        <img src="${front}" />
        </summary>
        <img src="${back}" />
      </details>
    </li>
    </ul>`;
    }).join('\n')}
</body>
</html>`;
    return html;
}
//# sourceMappingURL=combineIntoHTML.js.map