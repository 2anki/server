import { getPackagesFromZip } from '../../lib/getPackagesFromZip';
import { PrepareDeck } from '../../lib/parser/DeckParser';
import Package from '../../lib/parser/Package';
import Settings from '../../lib/parser/Settings';
import StorageHandler from '../../lib/storage/StorageHandler';
import { isHTMLFile, isZIPFile } from '../../lib/storage/checks';
import { UploadedFile } from '../../lib/storage/types';

class GeneratePackagesUseCase {
  constructor(private readonly storage: StorageHandler) {}

  async execute(
    isPatreon: boolean,
    files: UploadedFile[],
    settings: Settings
  ): Promise<Package[]> {
    let packages: Package[] = [];

    for (const file of files) {
      const fileContents = await this.storage.getFileContents(file.key);
      const filename = file.originalname;
      const key = file.key;

      if (isHTMLFile(filename)) {
        const d = await PrepareDeck(
          filename,
          [{ name: filename, contents: fileContents.Body }],
          settings
        );
        if (d) {
          const pkg = new Package(d.name, d.apkg);
          packages = packages.concat(pkg);
        }
      } else if (isZIPFile(filename) || isZIPFile(key)) {
        const { packages: extraPackages } = await getPackagesFromZip(
          fileContents.Body,
          isPatreon,
          settings
        );
        packages = packages.concat(extraPackages);
      }
    }
    return packages;
  }
}

export default GeneratePackagesUseCase;
