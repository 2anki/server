import { IEventsRepository, EventRow } from '../../data_layer/EventsRepository';

export const EVENTS_FLUSH_THRESHOLD = 100;
export const EVENTS_FLUSH_INTERVAL_MS = 5000;

export class EventsSink {
  private buffer: EventRow[] = [];

  private intervalHandle: NodeJS.Timeout | null = null;

  private pendingFlush: Promise<void> | null = null;

  constructor(
    private readonly repository: IEventsRepository,
    private readonly options: {
      flushThreshold?: number;
      flushIntervalMs?: number;
    } = {}
  ) {}

  start() {
    if (this.intervalHandle != null) return;
    const interval = this.options.flushIntervalMs ?? EVENTS_FLUSH_INTERVAL_MS;
    this.intervalHandle = setInterval(() => {
      void this.flush();
    }, interval);
    this.intervalHandle.unref();
  }

  stop() {
    if (this.intervalHandle != null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  record(row: EventRow) {
    this.buffer.push(row);
    this.maybeFlush();
  }

  async flush(): Promise<void> {
    const rows = this.buffer;
    this.buffer = [];
    if (rows.length === 0) return;
    await this.repository.insertEvents(rows).catch((error) => {
      console.error(`[events] dropping ${rows.length} event(s):`, error);
    });
  }

  waitForPendingFlush(): Promise<void> {
    return this.pendingFlush ?? Promise.resolve();
  }

  private maybeFlush() {
    const threshold = this.options.flushThreshold ?? EVENTS_FLUSH_THRESHOLD;
    if (this.buffer.length < threshold) return;
    if (this.pendingFlush != null) return;
    this.pendingFlush = this.flush().finally(() => {
      this.pendingFlush = null;
    });
  }
}
