import {
  InvalidScheduleTimeError,
  InvalidTimezoneError,
  nextDailyRunAt,
} from './nextDailyRunAt';

const utc = (iso: string) => new Date(iso);

describe('nextDailyRunAt', () => {
  test('schedules later today when the target hour is in the future (UTC)', () => {
    const now = utc('2026-05-07T10:00:00Z');
    const next = nextDailyRunAt('14:30', 'UTC', now);
    expect(next.toISOString()).toBe('2026-05-07T14:30:00.000Z');
  });

  test('schedules tomorrow when the target hour has already passed (UTC)', () => {
    const now = utc('2026-05-07T15:00:00Z');
    const next = nextDailyRunAt('14:30', 'UTC', now);
    expect(next.toISOString()).toBe('2026-05-08T14:30:00.000Z');
  });

  test('respects timezone offsets — 09:00 in America/New_York during DST (target later today)', () => {
    const now = utc('2026-05-07T10:00:00Z');
    const next = nextDailyRunAt('09:00', 'America/New_York', now);
    expect(next.toISOString()).toBe('2026-05-07T13:00:00.000Z');
  });

  test('respects timezone offsets — 09:00 in America/New_York after the time has passed', () => {
    const now = utc('2026-05-07T20:00:00Z');
    const next = nextDailyRunAt('09:00', 'America/New_York', now);
    expect(next.toISOString()).toBe('2026-05-08T13:00:00.000Z');
  });

  test('respects timezone offsets — 09:00 in Europe/Oslo (CEST = UTC+2)', () => {
    const now = utc('2026-05-07T05:00:00Z');
    const next = nextDailyRunAt('09:00', 'Europe/Oslo', now);
    expect(next.toISOString()).toBe('2026-05-07T07:00:00.000Z');
  });

  test('rejects malformed time strings', () => {
    expect(() => nextDailyRunAt('25:00', 'UTC')).toThrow(
      InvalidScheduleTimeError
    );
    expect(() => nextDailyRunAt('9:00', 'UTC')).toThrow(
      InvalidScheduleTimeError
    );
  });

  test('rejects malformed timezones', () => {
    expect(() => nextDailyRunAt('09:00', 'Mars/Olympus')).toThrow(
      InvalidTimezoneError
    );
  });
});
