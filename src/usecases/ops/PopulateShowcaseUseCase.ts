import { isFullBlock, isFullPage } from '@notionhq/client';
import { BlockObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { getNotionObjectTitle } from 'get-notion-object-title';

import { IShowcaseRepository } from '../../data_layer/ShowcaseRepository';
import { toPreviewBlock } from '../../controllers/helpers/toPreviewBlock';
import type { NotionService } from '../../services/NotionService/NotionService';
import type ApkgPreviewService from '../../services/ApkgPreviewService/ApkgPreviewService';
import type DownloadService from '../../services/DownloadService';
import StorageHandler from '../../lib/storage/StorageHandler';

const MAX_BLOCKS = 8;
const MAX_CARDS = 3;

export class PopulateShowcaseUseCase {
  constructor(
    private readonly showcaseRepo: IShowcaseRepository,
    private readonly notionService: NotionService,
    private readonly previewService: ApkgPreviewService,
    private readonly downloadService: DownloadService
  ) {}

  async execute(owner: string, pageId: string, apkgKey: string): Promise<void> {
    const api = await this.notionService.getNotionAPI(owner);

    const [blocksResponse, pageData] = await Promise.all([
      api.listBlocksPage(pageId, { pageSize: MAX_BLOCKS }),
      this.fetchPageTitle(api, pageId),
    ]);

    const notionBlocks = blocksResponse.results
      .filter((block): block is BlockObjectResponse => isFullBlock(block))
      .map(toPreviewBlock);

    const storage = new StorageHandler();
    const body = await this.downloadService.getFileBody(owner, apkgKey, storage);
    if (body == null) {
      throw new Error(`APKG file not found for key: ${apkgKey}`);
    }

    const cacheKey = `showcase:${apkgKey}`;
    const parsed = await this.previewService.parse(cacheKey, body as Buffer);
    const { cards } = this.previewService.getCardsPage(parsed, 0, MAX_CARDS, '');

    await this.showcaseRepo.upsert({
      pageTitle: pageData.pageTitle,
      notionBlocks,
      ankiCards: cards,
      populatedAt: new Date(),
    });
  }

  private async fetchPageTitle(
    api: Awaited<ReturnType<NotionService['getNotionAPI']>>,
    pageId: string
  ): Promise<{ pageTitle: string }> {
    try {
      const page = await api.getPage(pageId);
      if (page && isFullPage(page as PageObjectResponse)) {
        const full = page as PageObjectResponse;
        return { pageTitle: getNotionObjectTitle(full, { emoji: true }) };
      }
    } catch {
      // fall through to default
    }
    return { pageTitle: 'Untitled' };
  }
}
