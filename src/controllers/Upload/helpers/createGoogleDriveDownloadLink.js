"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleDriveDownloadLink = createGoogleDriveDownloadLink;
/**
 * Create a download link for a Google Drive file. The default URL is just a preview link and request user interaction
 * to download the file. This link will directly download the file.
 * @param file
 */
function createGoogleDriveDownloadLink(file) {
    return 'https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media';
}
//# sourceMappingURL=createGoogleDriveDownloadLink.js.map