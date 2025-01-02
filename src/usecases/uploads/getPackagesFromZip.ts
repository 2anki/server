import { Body } from 'aws-sdk/clients/s3';
import CardOption from '../../lib/parser/Settings/CardOption';
import { ZipHandler } from '../../lib/zip/zip';
import { PrepareDeck } from '../../infrastracture/adapters/fileConversion/PrepareDeck';
import Package from '../../lib/parser/Package';
import { checkFlashcardsLimits } from '../../lib/User/checkFlashcardsLimits';
import { PackageResult } from './GeneratePackagesUseCase';
import Workspace from '../../lib/parser/WorkSpace';
import { getMaxUploadCount } from '../../lib/misc/getMaxUploadCount';

import { isZipContentFileSupported } from './isZipContentFileSupported';

export const getPackagesFromZip = async (
  fileContents: Body | undefined,
  paying: boolean,
  settings: CardOption,
  workspace: Workspace
): Promise<PackageResult> => {
  const zipHandler = new ZipHandler(getMaxUploadCount(paying));
  const packages = [];

  if (!fileContents) {
    return { packages: [] };
  }

  await zipHandler.build(fileContents as Uint8Array, paying, settings);

  const fileNames = zipHandler.getFileNames();

  let cardCount = 0;
  for (const fileName of fileNames) {
    if (isZipContentFileSupported(fileName)) {
      const deck = await PrepareDeck({
        name: fileName,
        files: zipHandler.files,
        settings,
        noLimits: paying,
        workspace,
      });

      if (deck) {
        packages.push(new Package(deck.name));
        cardCount += deck.deck.reduce(
          (acc: number, d: { cards: any[] }) => acc + d.cards.length,
          0
        );

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
