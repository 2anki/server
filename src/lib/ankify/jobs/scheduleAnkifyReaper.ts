import { RacService } from '../../../services/ankify/RacService';

export const ANKIFY_IDLE_THRESHOLD_MS = 30 * 60 * 1000;
export const ANKIFY_REAP_INTERVAL_MS = 5 * 60 * 1000;

export const scheduleAnkifyReaper = (
  rac: RacService,
  options: {
    intervalMs?: number;
    idleThresholdMs?: number;
  } = {}
): NodeJS.Timeout => {
  const intervalMs = options.intervalMs ?? ANKIFY_REAP_INTERVAL_MS;
  const idleThresholdMs = options.idleThresholdMs ?? ANKIFY_IDLE_THRESHOLD_MS;

  const tick = async () => {
    try {
      const result = await rac.reapIdle(idleThresholdMs);
      if (result.stopped.length > 0) {
        console.info(
          `[ankify-reaper] stopped ${result.stopped.length} idle clients`,
          result.stopped
        );
      }
    } catch (error) {
      console.error('[ankify-reaper] tick failed', error);
    }
  };

  return setInterval(tick, intervalMs);
};
