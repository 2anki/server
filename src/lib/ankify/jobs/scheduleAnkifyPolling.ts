import { AnkifyNotionSubscriptionsRepositoryInterface } from '../../../data_layer/ankify/AnkifyNotionSubscriptionsRepository';
import { SyncNotionPageToRacUseCase } from '../../../usecases/ankify/SyncNotionPageToRacUseCase';

export const ANKIFY_POLLING_INTERVAL_MS = 5 * 60 * 1000;

export const scheduleAnkifyPolling = (
  subscriptions: AnkifyNotionSubscriptionsRepositoryInterface,
  useCase: SyncNotionPageToRacUseCase,
  options: { intervalMs?: number } = {}
): NodeJS.Timeout => {
  const intervalMs = options.intervalMs ?? ANKIFY_POLLING_INTERVAL_MS;

  const tick = async () => {
    let active: Awaited<ReturnType<typeof subscriptions.listEnabled>>;
    try {
      active = await subscriptions.listEnabled();
    } catch (error) {
      console.error('[ankify-polling] failed to list subscriptions', error);
      return;
    }
    for (const sub of active) {
      try {
        await useCase.execute({
          owner: sub.owner,
          notionPageId: sub.notion_page_id,
          trigger: 'polling',
        });
      } catch (error) {
        console.error(
          `[ankify-polling] sync failed for subscription ${sub.id}`,
          error
        );
      }
    }
  };

  return setInterval(tick, intervalMs);
};
