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
exports.processAndPrepareArchiveData = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const server_1 = require("react-dom/server");
const getUploadLimits_1 = require("../../misc/getUploadLimits");
const decompress_1 = require("./decompress");
const isZipContentFileSupported_1 = require("../../../usecases/uploads/isZipContentFileSupported");
const processAndPrepareArchiveData = (byteArray_1, ...args_1) => __awaiter(void 0, [byteArray_1, ...args_1], void 0, function* (byteArray, isPatron = false) {
    const size = Buffer.byteLength(byteArray);
    const limits = (0, getUploadLimits_1.getUploadLimits)(isPatron);
    if (size > limits.fileSize) {
        throw new Error((0, server_1.renderToStaticMarkup)((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["Your upload is too big, there is a max of ", size, " / $", limits.fileSize, ' ', "currently. ", (0, jsx_runtime_1.jsx)("a", { href: "https://alemayhu.com/patreon", children: "Become a patron" }), ' ', "to remove default limit or", ' ', (0, jsx_runtime_1.jsx)("a", { href: "https://2anki.net/login#login", children: "login" }), "."] })));
    }
    const decompressedData = yield (0, decompress_1.decompress)(byteArray);
    const fileNames = decompressedData.map((z) => z.name);
    const files = [];
    for (const name of fileNames) {
        const file = decompressedData.find((z) => z.name === name);
        let contents = file === null || file === void 0 ? void 0 : file.contents;
        if ((0, isZipContentFileSupported_1.isZipContentFileSupported)(name) && contents) {
            const s = new TextDecoder().decode(contents);
            files.push({ name, contents: s });
        }
        else if (contents) {
            files.push({ name, contents });
        }
    }
    return files;
});
exports.processAndPrepareArchiveData = processAndPrepareArchiveData;
//# sourceMappingURL=processAndPrepareArchiveData.js.map