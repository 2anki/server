import { INotionRepository } from '../../data_layer/NotionRespository';
import { NotionNotConnectedError } from './ExportReviewDataToNotionUseCase';

export interface CreatedNotionDatabase {
  id: string;
  url: string | null;
  title: string;
}

export interface NotionDatabaseCreator {
  createReviewTracker(
    token: string,
    input: { parentPageId: string; title: string }
  ): Promise<CreatedNotionDatabase>;
}

export interface CreateReviewTrackerInput {
  owner: number;
  parentPageId: string;
  title?: string;
}

export class CreateReviewTrackerDatabaseUseCase {
  constructor(
    private readonly notionRepo: INotionRepository,
    private readonly creator: NotionDatabaseCreator
  ) {}

  async execute(
    input: CreateReviewTrackerInput
  ): Promise<CreatedNotionDatabase> {
    if (input.parentPageId.trim().length === 0) {
      throw new Error('parent_page_id is required');
    }
    const token = await this.notionRepo.getNotionToken(String(input.owner));
    if (token == null || token.trim().length === 0) {
      throw new NotionNotConnectedError();
    }
    return this.creator.createReviewTracker(token, {
      parentPageId: input.parentPageId,
      title: (input.title ?? 'Anki review tracker').trim(),
    });
  }
}
