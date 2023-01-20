import { Body } from 'aws-sdk/clients/s3';
import { ZipHandler } from '../../../lib/anki/zip';
import { PrepareDeck } from '../../../lib/parser/DeckParser';
import Package from '../../../lib/parser/Package';
import Settings from '../../../lib/parser/Settings';

export const getPackagesFromZip = async (
  fileContents: Body | undefined,
  settings: Settings
) => {
  const zipHandler = new ZipHandler();
  let hasMarkdown = false;
  const packages = [];

  if (!fileContents) {
    return [];
  }

  await zipHandler.build(fileContents as Uint8Array);

  for (const fileName of zipHandler.getFileNames()) {
    if (fileName.match(/.html$/)) {
      const d = await PrepareDeck(fileName, zipHandler.files, settings);
      if (d) {
        packages.push(new Package(d.name, d.apkg));
      }
    } else if (fileName.match(/.md$/)) {
      hasMarkdown = true;
    }
  }

  return [packages, hasMarkdown];
};
