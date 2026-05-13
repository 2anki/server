import type { SendInactivityWarningsUseCase } from '../../../usecases/ops/SendInactivityWarningsUseCase';

export const INACTIVITY_WARNING_DAILY_LIMIT = 100;
export const INACTIVITY_WARNING_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const scheduleInactivityWarnings = (
  useCase: SendInactivityWarningsUseCase,
  options: { intervalMs?: number; limit?: number } = {}
): NodeJS.Timeout => {
  const intervalMs = options.intervalMs ?? INACTIVITY_WARNING_INTERVAL_MS;
  const limit = options.limit ?? INACTIVITY_WARNING_DAILY_LIMIT;

  const tick = async () => {
    try {
      const result = await useCase.execute(false, limit);
      console.info(`[inactivity-warnings] sent ${result.count} warning(s)`);
    } catch (error) {
      console.error('[inactivity-warnings] daily job failed:', error);
    }
  };

  return setInterval(tick, intervalMs);
};
