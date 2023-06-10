import { Body } from 'aws-sdk/clients/s3';
import { ZipHandler } from './anki/zip';
import { PrepareDeck } from './parser/DeckParser';
import Package from './parser/Package';
import { isHTMLFile, hasMarkdownFileName } from './storage/checks';
import Settings from './parser/Settings';

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

  zipHandler.build(fileContents as Uint8Array, isPatreon);

  const fileNames = zipHandler.getFileNames();

  for (const fileName of fileNames) {
    if (isHTMLFile(fileName)) {
      const deck = await PrepareDeck(fileName, zipHandler.files, settings);

      if (deck) {
        packages.push(new Package(deck.name, deck.apkg));
      }
    }
  }

  return { packages, containsMarkdown: hasMarkdownFileName(fileNames) };
};
