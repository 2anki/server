import CardOption from '../../lib/parser/Settings/CardOption';
import { ZipHandler } from '../../lib/zip/zip';
import { PrepareDeck } from '../../infrastracture/adapters/fileConversion/PrepareDeck';
import Package from '../../lib/parser/Package';
import { PackageResult } from './GeneratePackagesUseCase';
import Workspace from '../../lib/parser/WorkSpace';
import { getMaxUploadCount } from '../../lib/misc/getMaxUploadCount';

import { isZipContentFileSupported } from './isZipContentFileSupported';
import { getRelevantFiles } from './getRelevantFiles';
import { enableMarkdownForMarkdownUploads } from './enableMarkdownForMarkdownUploads';

export const getPackagesFromZip = async (
  fileContents: Buffer | Uint8Array | string | undefined,
  paying: boolean,
  settings: CardOption,
  workspace: Workspace,
  onProgress?: (step: string) => void
): Promise<PackageResult> => {
  const zipHandler = new ZipHandler(getMaxUploadCount(paying));
  const packages = [];

  if (!fileContents) {
    return { packages: [] };
  }

  await zipHandler.build(fileContents as Uint8Array, paying, settings);

  const fileNames = zipHandler.getFileNames();
  const supportedFileNames = fileNames.filter(isZipContentFileSupported);
  const effectiveSettings = enableMarkdownForMarkdownUploads(fileNames, settings);

  const warnings: string[] = [];

  if (effectiveSettings.claudeAIFlashcards && paying && fileNames.length > 0) {
    const rootName = fileNames[0];
    const deck = await PrepareDeck({
      name: rootName,
      files: zipHandler.files,
      settings: effectiveSettings,
      noLimits: paying,
      workspace,
      onProgress,
    });

    if (deck) {
      packages.push(new Package(deck.name, deck.cardCount ?? 0));
      if (deck.warning) warnings.push(deck.warning);
    }

    return { packages, warnings };
  }

  let cardCount = 0;
  for (const fileName of supportedFileNames) {
    const relevantFiles = getRelevantFiles(fileName, zipHandler.files);
    const deck = await PrepareDeck({
      name: fileName,
      files: relevantFiles,
      settings: effectiveSettings,
      noLimits: paying,
      workspace,
    });

    if (deck) {
      packages.push(new Package(deck.name, deck.cardCount ?? 0));
      if (deck.warning) warnings.push(deck.warning);
      cardCount += deck.deck.reduce((acc, d) => acc + d.cards.length, 0);
    }
  }

  return { packages, warnings };
};
