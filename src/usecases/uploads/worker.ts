import { parentPort, workerData } from 'worker_threads';
import { UploadedFile } from '../../lib/storage/types';
import CardOption from '../../lib/parser/Settings/CardOption';
import Package from '../../lib/parser/Package';
import fs from 'fs';
import { PrepareDeck } from '../../infrastracture/adapters/fileConversion/PrepareDeck';
import {
  isImageFile,
  isCompressedFile,
  isPPTFile,
  isDocxFile,
} from '../../lib/storage/checks';
import { getPackagesFromZip } from './getPackagesFromZip';
import Workspace from '../../lib/parser/WorkSpace';
import { isZipContentFileSupported } from './isZipContentFileSupported';

interface GenerationData {
  paying: boolean;
  files: UploadedFile[];
  settings: CardOption;
  workspace: Workspace;
}

/**
 * Get file contents from either path or buffer
 */
function getFileContents(file: UploadedFile): Buffer {
  if (!file.path) {
    return file.buffer;
  }

  try {
    // Check if a file exists before trying to read it
    if (fs.existsSync(file.path)) {
      return fs.readFileSync(file.path);
    }
    console.warn(`File not found at path: ${file.path}, using buffer instead`);
  } catch (error) {
    console.error(`Error reading file at path: ${file.path}`, error);
  }

  return file.buffer;
}

/**
 * Process a single file and return packages
 */
async function processFile(
  file: UploadedFile,
  fileContents: Buffer,
  paying: boolean,
  settings: CardOption,
  workspace: Workspace,
  onProgress: (step: string) => void
): Promise<Package[]> {
  const packages: Package[] = [];
  const filename = file.originalname;
  const key = file.key;

  // Check if it's a valid single file
  const allowImageQuizHtmlToAnki =
    paying && settings.imageQuizHtmlToAnki && isImageFile(filename);
  const isValidSingleFile =
    isZipContentFileSupported(filename) ||
    isPPTFile(filename) ||
    allowImageQuizHtmlToAnki ||
    isDocxFile(filename);

  if (isValidSingleFile) {
    const d = await PrepareDeck({
      name: filename,
      files: [{ name: filename, contents: fileContents }],
      settings,
      noLimits: paying,
      workspace,
      onProgress,
    });

    if (d) {
      packages.push(new Package(d.name));
    }
  }
  // Check if it's a compressed file
  else if (isCompressedFile(filename) || isCompressedFile(key)) {
    const { packages: extraPackages } = await getPackagesFromZip(
      fileContents,
      paying,
      settings,
      workspace,
      onProgress
    );
    packages.push(...extraPackages);
  }

  return packages;
}

async function doGenerationWork(data: GenerationData) {
  const { paying, files, settings, workspace } = data;
  let packages: Package[] = [];

  const onProgress = (step: string) => {
    parentPort?.postMessage({ type: 'progress', step });
  };

  for (const file of files) {
    const fileContents = getFileContents(file);
    const filePackages = await processFile(
      file,
      fileContents,
      paying,
      settings,
      workspace,
      onProgress
    );
    packages = packages.concat(filePackages);
  }

  return { type: 'result', packages };
}

doGenerationWork(workerData.data)
  .then((result) => parentPort?.postMessage(result))
  .catch((err) => parentPort?.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) }));
