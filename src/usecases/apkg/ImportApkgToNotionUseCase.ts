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
    jobId: string,
    options: { isPaying?: boolean } = {}
  ): Promise<void> {
    try {
      const cacheKey = `import:${owner}:${Date.now()}`;
      const parsed = await this.previewService.parse(cacheKey, fileBuffer);

      const result = this.blocksService.transform(parsed.collection);
      const FREE_NOTE_LIMIT = 50;
      if (!options.isPaying && result.totalNotes > FREE_NOTE_LIMIT) {
        throw new Error(
          `This deck has ${result.totalNotes} notes. Free plan supports up to ${FREE_NOTE_LIMIT}. Upgrade for unlimited imports.`
        );
      }
      const totalNotes = result.totalNotes;

      let mediaUrlMap = new Map<string, string>();
      if (parsed.mediaMap.size > 0) {
        try {
          await this.jobRepository.updateJobStatus(
            jobId, owner, 'processing', `uploading images`
          );
          mediaUrlMap = await this.uploadMediaToNotion(
            parsed.mediaMap,
            parsed.mediaEntries,
            notionApi,
            jobId,
            owner
          );
          result.deckPages = this.blocksService.transform(
            parsed.collection,
            mediaUrlMap
          ).deckPages;
        } catch (uploadError) {
          console.error(`[apkg-import] job=${jobId} media upload failed, continuing without images:`, uploadError);
        }
      }

      await this.jobRepository.updateJobStatus(
        jobId,
        owner,
        'processing',
        `0/${totalNotes} notes`
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
      console.error(`[apkg-import] job=${jobId} failed:`, error);
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
    notionApi: NotionAPIWrapper,
    jobId: string,
    owner: string
  ): Promise<Map<string, string>> {
    const idMap = new Map<string, string>();

    const imageEntries = [...mediaMap.entries()].filter(([name, idx]) => {
      const buf = mediaEntries.get(idx);
      const ext = path.extname(name).toLowerCase();
      return buf != null && IMAGE_EXTENSIONS.has(ext);
    });
    const totalImages = imageEntries.length;
    let uploaded = 0;

    for (const [originalName, archiveIndex] of imageEntries) {
      const buffer = mediaEntries.get(archiveIndex)!;
      const ext = path.extname(originalName).toLowerCase();
      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

      try {
        const fileUploadId = await notionApi.uploadFile(
          originalName,
          contentType,
          buffer
        );
        idMap.set(originalName, fileUploadId);
        uploaded++;
        await this.jobRepository.updateJobStatus(
          jobId, owner, 'processing',
          `uploading images ${uploaded}/${totalImages}`
        );
        await sleep(THROTTLE_MS);
      } catch (err) {
        console.error(`[apkg-import] failed to upload ${originalName}:`, err);
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
