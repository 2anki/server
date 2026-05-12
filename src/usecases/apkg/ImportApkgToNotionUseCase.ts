import path from 'path';
import ApkgPreviewService from '../../services/ApkgPreviewService/ApkgPreviewService';
import ApkgToNotionBlocksService, {
  DeckPage,
  NoteTooLargeError,
} from '../../services/ApkgToNotionBlocksService';
import NotionAPIWrapper from '../../services/NotionService/NotionAPIWrapper';
import JobRepository from '../../data_layer/JobRepository';
import { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints';

const BATCH_SIZE = 50;
const THROTTLE_MS = 350;

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp',
]);

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp',
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class ImportApkgToNotionUseCase {
  constructor(
    private readonly previewService: ApkgPreviewService,
    private readonly blocksService: ApkgToNotionBlocksService,
    private readonly jobRepository: JobRepository
  ) {}

  async execute(
    fileBuffer: Buffer,
    parentPageId: string,
    owner: string,
    notionApi: NotionAPIWrapper,
    jobId: string
  ): Promise<void> {
    try {
      const cacheKey = `import:${owner}:${Date.now()}`;
      const parsed = await this.previewService.parse(cacheKey, fileBuffer);

      const mediaUrlMap = await this.uploadMediaToNotion(
        parsed.mediaMap,
        parsed.mediaEntries,
        notionApi
      );

      const result = this.blocksService.transform(
        parsed.collection,
        mediaUrlMap
      );

      await this.jobRepository.updateJobStatus(
        jobId,
        owner,
        'processing',
        `0/${result.totalNotes} notes`
      );

      let imported = 0;

      for (const deckPage of result.deckPages) {
        imported = await this.writeDeckPage(
          notionApi,
          deckPage,
          parentPageId,
          jobId,
          owner,
          imported,
          result.totalNotes
        );
      }

      const pageResponse = await notionApi.getPage(parentPageId);
      const notionUrl =
        pageResponse && 'url' in pageResponse
          ? (pageResponse as { url?: string }).url ?? null
          : null;

      await this.jobRepository.updateJobStatus(
        jobId,
        owner,
        'done',
        JSON.stringify({
          imported,
          total_notes: result.totalNotes,
          notion_page_url: notionUrl,
        })
      );
    } catch (error) {
      const message =
        error instanceof NoteTooLargeError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Import failed';
      await this.jobRepository
        .updateJobStatus(jobId, owner, 'failed', message)
        .catch(() => {});
    }
  }

  private async uploadMediaToNotion(
    mediaMap: Map<string, string>,
    mediaEntries: Map<string, Buffer>,
    notionApi: NotionAPIWrapper
  ): Promise<Map<string, string>> {
    const idMap = new Map<string, string>();

    for (const [originalName, archiveIndex] of mediaMap) {
      const buffer = mediaEntries.get(archiveIndex);
      if (buffer == null) continue;

      const ext = path.extname(originalName).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

      try {
        const fileUploadId = await notionApi.uploadFile(
          originalName,
          contentType,
          buffer
        );
        idMap.set(originalName, fileUploadId);
        await sleep(THROTTLE_MS);
      } catch {
        // Skip failed uploads — text still imports fine
      }
    }

    return idMap;
  }

  private async writeDeckPage(
    notionApi: NotionAPIWrapper,
    deckPage: DeckPage,
    parentId: string,
    jobId: string,
    owner: string,
    imported: number,
    totalNotes: number
  ): Promise<number> {
    const page = await notionApi.createPage(parentId, deckPage.title);
    await sleep(THROTTLE_MS);

    const blocks = deckPage.children as unknown as BlockObjectRequest[];
    let currentImported = imported;

    for (let i = 0; i < blocks.length; i += BATCH_SIZE) {
      const batch = blocks.slice(i, i + BATCH_SIZE);
      await notionApi.appendBlocks(page.id, batch);
      currentImported += batch.length;

      await this.jobRepository.updateJobStatus(
        jobId,
        owner,
        'processing',
        `${currentImported}/${totalNotes} notes`
      );

      await sleep(THROTTLE_MS);
    }

    for (const subDeck of deckPage.subDecks) {
      currentImported = await this.writeDeckPage(
        notionApi,
        subDeck,
        page.id,
        jobId,
        owner,
        currentImported,
        totalNotes
      );
    }

    return currentImported;
  }
}
