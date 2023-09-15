import fs from 'fs';

import { ZipHandler } from '../../lib/anki/zip';
import { PrepareDeck } from '../../lib/parser/DeckParser';
import Package from '../../lib/parser/Package';
import Settings from '../../lib/parser/Settings';
import StorageHandler from '../../lib/storage/StorageHandler';
import {
  isCSVFile,
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isZIPFile,
} from '../../lib/storage/checks';
import { UploadedFile } from '../../lib/storage/types';

import { Body } from 'aws-sdk/clients/s3';

export interface PackageResult {
  packages: Package[];
}

export const isFileSupported = (filename: string) =>
  isHTMLFile(filename) ??
  isMarkdownFile(filename) ??
  isPlainText(filename) ??
  isCSVFile(filename);

const getPackagesFromZip = async (
  fileContents: Body | undefined,
  isPatreon: boolean,
  settings: Settings
): Promise<PackageResult> => {
  const zipHandler = new ZipHandler();
  const packages = [];

  if (!fileContents) {
    return { packages: [] };
  }

  zipHandler.build(fileContents as Uint8Array, isPatreon);

  const fileNames = zipHandler.getFileNames();

  for (const fileName of fileNames) {
    if (isFileSupported(fileName)) {
      const deck = await PrepareDeck(fileName, zipHandler.files, settings);

      if (deck) {
        packages.push(new Package(deck.name, deck.apkg));
      }
    }
  }

  return { packages };
};

class GeneratePackagesUseCase {
  constructor(private readonly storage: StorageHandler) {}

  async execute(
    isPatreon: boolean,
    files: UploadedFile[],
    settings: Settings
  ): Promise<PackageResult> {
    let packages: Package[] = [];

    for (const file of files) {
      const fileContents = fs.readFileSync(file.path);
      const filename = file.originalname;
      const key = file.key;

      if (isFileSupported(filename)) {
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: fileContents }],
          settings
        );
        if (d) {
          const pkg = new Package(d.name, d.apkg);
          packages = packages.concat(pkg);
        }
      } else if (isZIPFile(filename) || isZIPFile(key)) {
        const { packages: extraPackages } = await getPackagesFromZip(
          fileContents,
          isPatreon,
          settings
        );
        packages = packages.concat(extraPackages);
      }
    }
    return { packages };
  }
}

export default GeneratePackagesUseCase;
