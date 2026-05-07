import { AnkifyExportSchedule } from '../../entities/ankify';
import { AnkifyExportSchedulesRepositoryInterface } from '../../data_layer/ankify/AnkifyExportSchedulesRepository';
import { ExportReviewDataToNotionUseCase } from '../../usecases/ankify/ExportReviewDataToNotionUseCase';
import { nextDailyRunAt } from '../../lib/ankify/nextDailyRunAt';

export class AnkifyExportScheduler {
  private timers = new Map<number, NodeJS.Timeout>();

  constructor(
    private readonly repo: AnkifyExportSchedulesRepositoryInterface,
    private readonly useCase: ExportReviewDataToNotionUseCase,
    private readonly now: () => Date = () => new Date()
  ) {}

  async recoverAll(): Promise<number> {
    const schedules = await this.repo.listEnabled();
    for (const schedule of schedules) {
      this.armSchedule(schedule);
    }
    return schedules.length;
  }

  async configure(schedule: AnkifyExportSchedule): Promise<void> {
    this.cancel(schedule.owner);
    if (schedule.enabled) {
      this.armSchedule(schedule);
    }
  }

  cancel(owner: number): void {
    const existing = this.timers.get(owner);
    if (existing != null) {
      clearTimeout(existing);
      this.timers.delete(owner);
    }
  }

  shutdown(): void {
    for (const [, timer] of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  isArmed(owner: number): boolean {
    return this.timers.has(owner);
  }

  private armSchedule(schedule: AnkifyExportSchedule): void {
    const target = nextDailyRunAt(
      schedule.time_of_day,
      schedule.timezone,
      this.now()
    );
    const delayMs = Math.max(target.getTime() - this.now().getTime(), 1000);

    const timer = setTimeout(async () => {
      try {
        await this.useCase.execute({
          owner: schedule.owner,
          databaseId: schedule.database_id,
          dateRangeDays: schedule.date_range_days ?? undefined,
        });
        await this.repo.markRun(schedule.id);
      } catch (error) {
        console.error(
          `[ankify-scheduler] schedule ${schedule.id} for owner ${schedule.owner} failed`,
          error
        );
      } finally {
        const refreshed = await this.repo.findByOwner(schedule.owner);
        if (refreshed != null && refreshed.enabled) {
          this.armSchedule(refreshed);
        } else {
          this.timers.delete(schedule.owner);
        }
      }
    }, delayMs);

    this.timers.set(schedule.owner, timer);
  }
}
