import { parentPort, workerData } from 'worker_threads';
import { UploadedFile } from '../../lib/storage/types';
import Settings from '../../lib/parser/Settings';
import Package from '../../lib/parser/Package';
import fs from 'fs';
import { PrepareDeck } from '../../lib/parser/PrepareDeck';
import {
  isImageFile,
  isPotentialZipFile,
  isZIPFile,
} from '../../lib/storage/checks';
import { getPackagesFromZip } from './getPackagesFromZip';
import Workspace from '../../lib/parser/WorkSpace';
import { isZipContentFileSupported } from './isZipContentFileSupported';

interface GenerationData {
  paying: boolean;
  files: UploadedFile[];
  settings: Settings;
  workspace: Workspace;
}

function doGenerationWork(data: GenerationData) {
  console.log('doGenerationWork');
  return new Promise(async (resolve) => {
    console.log('starting generation');
    const { paying, files, settings, workspace } = data;
    let packages: Package[] = [];

    for (const file of files) {
      const fileContents = file.path ? fs.readFileSync(file.path) : file.buffer;
      const filename = file.originalname;
      const key = file.key;

      const allowImageQuizHtmlToAnki =
        paying && settings.imageQuizHtmlToAnki && isImageFile(filename);
      if (isZipContentFileSupported(filename) || allowImageQuizHtmlToAnki) {
        const d = await PrepareDeck({
          name: filename,
          files: [{ name: filename, contents: fileContents }],
          settings,
          noLimits: paying,
          workspace,
        });
        if (d) {
          const pkg = new Package(d.name);
          packages = packages.concat(pkg);
        }
      } else if (
        isZIPFile(filename) ||
        isZIPFile(key) ||
        isPotentialZipFile(filename) ||
        isPotentialZipFile(key)
      ) {
        const { packages: extraPackages } = await getPackagesFromZip(
          fileContents,
          paying,
          settings,
          workspace
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
