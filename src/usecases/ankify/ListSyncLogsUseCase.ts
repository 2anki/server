import { AnkifySyncLog } from '../../entities/ankify';
import { AnkifySyncLogsRepositoryInterface } from '../../data_layer/ankify/AnkifySyncLogsRepository';

export class ListSyncLogsUseCase {
  constructor(private readonly repo: AnkifySyncLogsRepositoryInterface) {}

  execute(
    owner: number,
    options: { limit?: number; status?: string } = {}
  ): Promise<AnkifySyncLog[]> {
    return this.repo.listByOwner(owner, options);
  }
}
