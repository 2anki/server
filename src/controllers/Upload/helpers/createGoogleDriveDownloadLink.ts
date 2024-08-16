import { GoogleDriveFile } from '../../../data_layer/GoogleDriveRepository';

export function createGoogleDriveDownloadLink(file: GoogleDriveFile) {
  return 'https://www.googleapis.com/drive/v3/files/' + file.id + '?alt=media';
}
