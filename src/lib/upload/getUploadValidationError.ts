import { UploadedFile } from '../storage/types';

function isAnkiDeck(file: UploadedFile): boolean {
  return file.originalname.toLowerCase().endsWith('.apkg');
}

function isEmptyFile(file: UploadedFile): boolean {
  return file.size === 0;
}

export function getUploadValidationError(files: UploadedFile[]): Error | null {
  if (!files || files.length === 0) {
    return new Error('Please select a file to upload.');
  }

  for (const file of files) {
    if (isEmptyFile(file)) {
      return new Error(
        `"${file.originalname}" appears to be empty. Please re-export your file and try again.`
      );
    }

    if (isAnkiDeck(file)) {
      return new Error(
        `"${file.originalname}" is already an Anki deck. 2anki converts source files like Notion HTML exports, not existing decks.`
      );
    }
  }

  return null;
}
