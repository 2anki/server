import fs from 'node:fs';
import { Body } from 'aws-sdk/clients/s3';
import pLimit from 'p-limit';
import CardOption from '../../lib/parser/Settings/CardOption';
import { ZipHandler } from '../../lib/zip/zip';
import { PrepareDeck, prepareDeckInfoOnly } from '../../infrastracture/adapters/fileConversion/PrepareDeck';
import Package from '../../lib/parser/Package';
import { PackageResult } from './GeneratePackagesUseCase';
import Workspace from '../../lib/parser/WorkSpace';
import { getMaxUploadCount } from '../../lib/misc/getMaxUploadCount';

import { isZipContentFileSupported } from './isZipContentFileSupported';
import { getRelevantFiles } from './getRelevantFiles';
import { enableMarkdownForMarkdownUploads } from './enableMarkdownForMarkdownUploads';
import CardGenerator from '../../lib/anki/CardGenerator';

const resolveBuildConcurrency = (): number => {
  const raw = Number.parseInt(process.env.UPLOAD_BUILD_CONCURRENCY ?? '', 10);
  return Number.isFinite(raw) && raw >= 1 ? raw : 4;
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function buildDeckBatch(
  fileNames: string[],
  zipHandler: ZipHandler,
  settings: CardOption,
  paying: boolean,
  workspace: Workspace
): Promise<{ packages: Package[]; warnings: string[] }> {
  const packages: Package[] = [];
  const warnings: string[] = [];

  const preparedResults = await Promise.all(
    fileNames.map((fileName) => {
      const relevantFiles = getRelevantFiles(fileName, zipHandler.files);
      const deckSubWorkspace = Workspace.subdir(workspace.location);
      return prepareDeckInfoOnly(
        {
          name: fileName,
          files: relevantFiles,
          settings,
          noLimits: paying,
          workspace: deckSubWorkspace,
        },
        deckSubWorkspace
      );
    })
  );

  const batchEntries = preparedResults
    .filter((r) => !r.needsIndividualBuild)
    .map((r) => ({ input: r.deckInfoPath, output: r.outputPath }));

  const stragglers = preparedResults.filter((r) => r.needsIndividualBuild);

  if (batchEntries.length > 0) {
    const gen = new CardGenerator(workspace.location);
    const apkgPaths = await gen.runBatch(batchEntries);

    const batchResults = preparedResults.filter((r) => !r.needsIndividualBuild);
    for (let i = 0; i < batchResults.length; i++) {
      const result = batchResults[i];
      const apkgPath = apkgPaths[i];
      if (apkgPath) {
        const apkg = fs.readFileSync(apkgPath);
        packages.push(new Package(result.name, result.cardCount));
        if (result.warning) warnings.push(result.warning);
      }
    }
  }

  for (const straggler of stragglers) {
    const relevantFiles = getRelevantFiles(straggler.inputFileName, zipHandler.files);
    const deck = await PrepareDeck({
      name: straggler.inputFileName,
      files: relevantFiles,
      settings,
      noLimits: paying,
      workspace,
    });
    if (deck) {
      packages.push(new Package(deck.name, deck.cardCount ?? 0));
      if (deck.warning) warnings.push(deck.warning);
    }
  }

  return { packages, warnings };
}

export const getPackagesFromZip = async (
  fileContents: Body | undefined,
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

  const cap = resolveBuildConcurrency();
  const batchSize = Math.ceil(supportedFileNames.length / cap);

  if (supportedFileNames.length <= 1 || batchSize <= 1) {
    const limit = pLimit(cap);
    const results = await Promise.all(
      supportedFileNames.map((fileName) =>
        limit(() => {
          const relevantFiles = getRelevantFiles(fileName, zipHandler.files);
          return PrepareDeck({
            name: fileName,
            files: relevantFiles,
            settings: effectiveSettings,
            noLimits: paying,
            workspace,
          });
        })
      )
    );

    let cardCount = 0;
    for (const deck of results) {
      if (deck) {
        packages.push(new Package(deck.name, deck.cardCount ?? 0));
        if (deck.warning) warnings.push(deck.warning);
        cardCount += deck.deck.reduce((acc, d) => acc + d.cards.length, 0);
      }
    }

    return { packages, warnings };
  }

  const chunks = chunkArray(supportedFileNames, batchSize);
  const limit = pLimit(cap);

  const batchResults = await Promise.all(
    chunks.map((chunk) =>
      limit(() =>
        buildDeckBatch(chunk, zipHandler, effectiveSettings, paying, workspace)
      )
    )
  );

  for (const result of batchResults) {
    packages.push(...result.packages);
    if (result.warnings) warnings.push(...result.warnings);
  }

  return { packages, warnings };
};
