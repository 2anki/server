import fs from 'fs';

import { ZipHandler } from '../../lib/anki/zip';
import Package from '../../lib/parser/Package';
import Settings from '../../lib/parser/Settings';
import {
  isCSVFile,
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
  isZIPFile,
} from '../../lib/storage/checks';
import { UploadedFile } from '../../lib/storage/types';

import { Body } from 'aws-sdk/clients/s3';
import { PrepareDeck } from '../../lib/parser/PrepareDeck';
import { checkFlashcardsLimits } from '../../lib/User/checkFlashcardsLimits';

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
  paying: boolean,
  settings: Settings
): Promise<PackageResult> => {
  const zipHandler = new ZipHandler();
  const packages = [];

  if (!fileContents) {
    return { packages: [] };
  }

  zipHandler.build(fileContents as Uint8Array, paying);

  const fileNames = zipHandler.getFileNames();

  let cardCount = 0;
  for (const fileName of fileNames) {
    if (isFileSupported(fileName)) {
      const deck = await PrepareDeck(fileName, zipHandler.files, settings);

      if (deck) {
        packages.push(new Package(deck.name, deck.apkg));
        cardCount += deck.deck.reduce((acc, d) => acc + d.cards.length, 0);

        // Checking the limit in place while iterating through the decks
        checkFlashcardsLimits({
          cards: 0,
          decks: deck.deck,
          paying,
        });
      }
    }

    // Checking the limit in place while iterating through the files
    checkFlashcardsLimits({
      cards: cardCount,
      paying: paying,
    });
  }

  return { packages };
};

class GeneratePackagesUseCase {
  async execute(
    paying: boolean,
    files: UploadedFile[],
    settings: Settings
  ): Promise<PackageResult> {
    let packages: Package[] = [];

    for (const file of files) {
      const fileContents = file.path ? fs.readFileSync(file.path) : file.buffer;
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
          paying,
          settings
        );
        packages = packages.concat(extraPackages);
      }
    }
    return { packages };
  }
}

export default GeneratePackagesUseCase;
