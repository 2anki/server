import { Body } from 'aws-sdk/clients/s3';
import { ZipHandler } from '../../../lib/anki/zip';
import { PrepareDeck } from '../../../lib/parser/DeckParser';
import Package from '../../../lib/parser/Package';
import Settings from '../../../lib/parser/Settings';
import { hasMarkdownFileName } from '../../../lib/storage/checks';

export interface PackageResult {
  packages: Package[];
  containsMarkdown: boolean;
}

export const getPackagesFromZip = async (
  fileContents: Body | undefined,
  isPatreon: boolean,
  settings: Settings
): Promise<PackageResult> => {
  const zipHandler = new ZipHandler();
  const packages = [];

  if (!fileContents) {
    return { packages: [], containsMarkdown: false };
  }

  await zipHandler.build(fileContents as Uint8Array, isPatreon);

  const fileNames = zipHandler.getFileNames();

  for (const fileName of fileNames) {
    if (fileName.match(/.html$/)) {
      const deck = await PrepareDeck(fileName, zipHandler.files, settings);

      if (deck) {
        packages.push(new Package(deck.name, deck.apkg));
      }
    }
  }

  return { packages, containsMarkdown: hasMarkdownFileName(fileNames) };
};
