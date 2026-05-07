import { INotionRepository } from '../../data_layer/NotionRespository';
import { NotionNotConnectedError } from './ExportReviewDataToNotionUseCase';

export interface NotionDatabaseSummary {
  id: string;
  title: string;
  url: string | null;
  has_review_shape: boolean;
}

export interface NotionDatabaseLister {
  listDatabases(token: string): Promise<NotionDatabaseSummary[]>;
}

export class ListNotionDatabasesUseCase {
  constructor(
    private readonly notionRepo: INotionRepository,
    private readonly lister: NotionDatabaseLister
  ) {}

  async execute(owner: number): Promise<NotionDatabaseSummary[]> {
    const token = await this.notionRepo.getNotionToken(String(owner));
    if (token == null || token.trim().length === 0) {
      throw new NotionNotConnectedError();
    }
    return this.lister.listDatabases(token);
  }
}
