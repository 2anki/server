import {
  AnkifyExportSchedule,
  UpsertAnkifyExportSchedule,
} from '../../entities/ankify';
import { AnkifyExportSchedulesRepositoryInterface } from '../../data_layer/ankify/AnkifyExportSchedulesRepository';
import { AnkifyExportScheduler } from '../../services/ankify/AnkifyExportScheduler';
import { nextDailyRunAt } from '../../lib/ankify/nextDailyRunAt';

export interface ConfigureExportScheduleInput {
  owner: number;
  databaseId: string;
  timeOfDay: string;
  timezone: string;
  dateRangeDays: number | null;
  enabled: boolean;
}

export class ConfigureExportScheduleUseCase {
  constructor(
    private readonly repo: AnkifyExportSchedulesRepositoryInterface,
    private readonly resolveScheduler: () => AnkifyExportScheduler
  ) {}

  async execute(
    input: ConfigureExportScheduleInput
  ): Promise<AnkifyExportSchedule> {
    if (input.databaseId.trim().length === 0) {
      throw new Error('database_id is required');
    }
    nextDailyRunAt(input.timeOfDay, input.timezone);

    const upsertInput: UpsertAnkifyExportSchedule = {
      owner: input.owner,
      database_id: input.databaseId,
      time_of_day: input.timeOfDay,
      timezone: input.timezone,
      date_range_days: input.dateRangeDays,
      enabled: input.enabled,
    };

    const schedule = await this.repo.upsertByOwner(upsertInput);
    await this.resolveScheduler().configure(schedule);
    return schedule;
  }
}

export {
  InvalidScheduleTimeError,
  InvalidTimezoneError,
} from '../../lib/ankify/nextDailyRunAt';
