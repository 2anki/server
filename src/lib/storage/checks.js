"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHiddenFileOrDirectory = exports.isXLSXFile = exports.isImageFile = exports.isPotentialZipFile = exports.isCompressedFile = exports.isPPTFile = exports.isPDFFile = exports.isCSVFile = exports.isImageFileEmbedable = exports.isVimeoURL = exports.isTwitterURL = exports.isSoundCloudURL = exports.isPlainText = exports.isZIPFile = exports.isPotentiallyHTMLFile = exports.isHTMLFile = exports.isMarkdownFile = void 0;
exports.hasMarkdownFileName = hasMarkdownFileName;
const isMarkdownFile = (fileName) => /.md$/i.exec(fileName);
exports.isMarkdownFile = isMarkdownFile;
const isHTMLFile = (fileName) => /.html$/i.exec(fileName);
exports.isHTMLFile = isHTMLFile;
const isPotentiallyHTMLFile = (fileName) => (0, exports.isHTMLFile)(fileName) || fileName.toLowerCase().endsWith('.htm');
exports.isPotentiallyHTMLFile = isPotentiallyHTMLFile;
const isZIPFile = (fileName) => /.zip$/i.exec(fileName);
exports.isZIPFile = isZIPFile;
const isPlainText = (fileName) => /\.txt$/i.exec(fileName);
exports.isPlainText = isPlainText;
function hasMarkdownFileName(fileNames) {
    return fileNames.some(exports.isMarkdownFile);
}
const isSoundCloudURL = (url) => /soundcloud\.com/.exec(url);
exports.isSoundCloudURL = isSoundCloudURL;
const isTwitterURL = (url) => /twitter\.com/.exec(url);
exports.isTwitterURL = isTwitterURL;
const isVimeoURL = (url) => /vimeo\.com/.exec(url);
exports.isVimeoURL = isVimeoURL;
const isImageFileEmbedable = (url) => {
    const isLocalPath = !url.startsWith('http') && !url.startsWith('data:image');
    const hasTraversal = url.includes('../') || url.includes('..\\');
    return isLocalPath && !hasTraversal;
};
exports.isImageFileEmbedable = isImageFileEmbedable;
const isCSVFile = (fileName) => /.csv$/i.exec(fileName);
exports.isCSVFile = isCSVFile;
const isPDFFile = (fileName) => /.pdf$/i.exec(fileName);
exports.isPDFFile = isPDFFile;
const isPPTFile = (fileName) => /\.(ppt|pptx)$/i.exec(fileName);
exports.isPPTFile = isPPTFile;
/**
 * Checks if a file is a compressed file based on its extension or naming pattern.
 * This includes .zip files, .z files (Unix compress format), temporary downloads,
 * and files without a proper extension.
 * @param filename
 * @returns boolean indicating if the file is likely a compressed file
 */
const isCompressedFile = (filename) => {
    if (!filename) {
        return false;
    }
    const lowerCaseFilename = filename.toLowerCase();
    if (lowerCaseFilename.endsWith('.crdownload') ||
        lowerCaseFilename.endsWith('.tmp') ||
        lowerCaseFilename.endsWith('.zip') ||
        lowerCaseFilename.endsWith('.z')) {
        return true;
    }
    return filename.trim().endsWith('.') || !filename.includes('.');
};
exports.isCompressedFile = isCompressedFile;
// Maintain backward compatibility
exports.isPotentialZipFile = exports.isCompressedFile;
const isImageFile = (name) => (0, exports.isImageFileEmbedable)(name) &&
    (name.toLowerCase().endsWith('.png') ||
        name.toLowerCase().endsWith('.jpg') ||
        name.toLowerCase().endsWith('.jpeg') ||
        name.toLowerCase().endsWith('.gif') ||
        name.toLowerCase().endsWith('.bmp') ||
        name.toLowerCase().endsWith('.svg'));
exports.isImageFile = isImageFile;
const isXLSXFile = (fileName) => /.xlsx$/i.test(fileName);
exports.isXLSXFile = isXLSXFile;
const isHiddenFileOrDirectory = (fileName) => fileName.startsWith('.') ||
    fileName.endsWith('/') ||
    fileName.startsWith('__MACOSX');
exports.isHiddenFileOrDirectory = isHiddenFileOrDirectory;
//# sourceMappingURL=checks.js.map