import { ZipHandler } from '../../../lib/anki/zip';
import { PrepareDeck } from '../../../lib/parser/DeckParser';
import Package from '../../../lib/parser/Package';
import Settings from '../../../lib/parser/Settings';

export const getPackagesFromZip = async (
  fileContents: string,
  isPatreon: boolean,
  settings: Settings
) => {
  const zipHandler = new ZipHandler();
  let hasMarkdown = false;
  const packages = [];

  await zipHandler.build(fileContents, isPatreon);

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
