import { AnkifyExportSchedule } from '../../entities/ankify';
import { AnkifyExportSchedulesRepositoryInterface } from '../../data_layer/ankify/AnkifyExportSchedulesRepository';

export class GetExportScheduleUseCase {
  constructor(
    private readonly repo: AnkifyExportSchedulesRepositoryInterface
  ) {}

  execute(owner: number): Promise<AnkifyExportSchedule | null> {
    return this.repo.findByOwner(owner);
  }
}
