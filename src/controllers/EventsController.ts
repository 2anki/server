import { Request, Response } from 'express';
import { KNOWN_EVENTS, KnownEvent } from '../types/AnalyticsEvents';
import { TrackEventUseCase } from '../usecases/events/TrackEventUseCase';

const PROPS_MAX_BYTES = 1024;

export class EventsController {
  constructor(private readonly trackEventUseCase: TrackEventUseCase) {}

  track(req: Request, res: Response): void {
    const { name, props } = req.body as {
      name: unknown;
      props?: unknown;
    };

    if (typeof name !== 'string' || !KNOWN_EVENTS.has(name as KnownEvent)) {
      res.status(400).json({ error: 'Unknown event name' });
      return;
    }

    const safeProps = this.resolveProps(props);
    if (safeProps === null) {
      res.status(400).json({ error: 'Invalid props' });
      return;
    }

    const serialized = JSON.stringify(safeProps);
    if (serialized.length > PROPS_MAX_BYTES) {
      res.status(400).json({ error: 'Props too large' });
      return;
    }

    const userId = (res.locals.owner as number | undefined) ?? null;
    const anonymousId = (req.cookies?.anon_id as string | undefined) ?? null;

    this.trackEventUseCase.execute({
      name: name as KnownEvent,
      userId,
      anonymousId,
      props: safeProps,
    });

    res.status(202).end();
  }

  private resolveProps(
    raw: unknown
  ): Record<string, unknown> | null {
    if (raw == null) return {};
    if (typeof raw !== 'object' || Array.isArray(raw)) return null;
    return raw as Record<string, unknown>;
  }
}
