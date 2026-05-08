import { AnkifyExportSchedulesRepositoryInterface } from '../../data_layer/ankify/AnkifyExportSchedulesRepository';
import { AnkifyExportScheduler } from '../../services/ankify/AnkifyExportScheduler';

export class DeleteExportScheduleUseCase {
  constructor(
    private readonly repo: AnkifyExportSchedulesRepositoryInterface,
    private readonly resolveScheduler: () => AnkifyExportScheduler
  ) {}

  async execute(owner: number): Promise<void> {
    await this.repo.deleteByOwner(owner);
    this.resolveScheduler().cancel(owner);
  }
}
