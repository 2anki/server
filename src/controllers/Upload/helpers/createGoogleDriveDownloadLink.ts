import { GoogleDriveFile } from '../../../data_layer/GoogleDriveRepository';

/**
 * Create a download link for a Google Drive file. The default URL is just a preview link and request user interaction
 * to download the file. This link will directly download the file.
 * @param file
 */
export function createGoogleDriveDownloadLink(file: GoogleDriveFile) {
  return 'https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media';
}
