import { Body } from 'aws-sdk/clients/s3';
import Settings from '../../lib/parser/Settings';
import { ZipHandler } from '../../lib/anki/zip';
import { PrepareDeck } from '../../lib/parser/PrepareDeck';
import Package from '../../lib/parser/Package';
import { checkFlashcardsLimits } from '../../lib/User/checkFlashcardsLimits';
import { PackageResult } from './GeneratePackagesUseCase';
import {
  isCSVFile,
  isHTMLFile,
  isMarkdownFile,
  isPlainText,
} from '../../lib/storage/checks';

export const isFileSupported = (filename: string) =>
  isHTMLFile(filename) ??
  isMarkdownFile(filename) ??
  isPlainText(filename) ??
  isCSVFile(filename);

export const getPackagesFromZip = async (
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
      const deck = await PrepareDeck({
        name: fileName,
        files: zipHandler.files,
        settings,
        noLimits: paying,
      });

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
