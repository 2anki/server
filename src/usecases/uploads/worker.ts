import { parentPort, workerData } from 'worker_threads';
import { UploadedFile } from '../../lib/storage/types';
import Settings from '../../lib/parser/Settings';
import Package from '../../lib/parser/Package';
import fs from 'fs';
import { PrepareDeck } from '../../lib/parser/PrepareDeck';
import { isZIPFile } from '../../lib/storage/checks';
import { getPackagesFromZip, isFileSupported } from './getPackagesFromZip';

interface GenerationData {
  paying: boolean;
  files: UploadedFile[];
  settings: Settings;
}

function doGenerationWork(data: GenerationData) {
  console.log('doGenerationWork');
  return new Promise(async (resolve) => {
    console.log('starting generation');
    const { paying, files, settings } = data;
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
    resolve({ packages });
  });
}

doGenerationWork(workerData.data)
  .then((result) => {
    parentPort?.postMessage(result);
  })
  .catch(parentPort?.postMessage);
