const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class InvalidScheduleTimeError extends Error {
  constructor(value: string) {
    super(`Invalid time-of-day "${value}"; expected HH:MM`);
    this.name = 'InvalidScheduleTimeError';
  }
}

export class InvalidTimezoneError extends Error {
  constructor(value: string) {
    super(`Invalid IANA timezone "${value}"`);
    this.name = 'InvalidTimezoneError';
  }
}

const isValidTimezone = (tz: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const offsetMinutesAt = (instant: Date, timezone: string): number => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(instant);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      lookup[part.type] = part.value;
    }
  }
  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour === '24' ? '0' : lookup.hour),
    Number(lookup.minute),
    Number(lookup.second)
  );
  return Math.round((asUtc - instant.getTime()) / 60_000);
};

export const nextDailyRunAt = (
  timeOfDay: string,
  timezone: string,
  now: Date = new Date()
): Date => {
  const match = TIME_PATTERN.exec(timeOfDay);
  if (match == null) {
    throw new InvalidScheduleTimeError(timeOfDay);
  }
  if (!isValidTimezone(timezone)) {
    throw new InvalidTimezoneError(timezone);
  }
  const targetHour = Number(match[1]);
  const targetMinute = Number(match[2]);

  const offsetNow = offsetMinutesAt(now, timezone);
  const localNow = new Date(now.getTime() + offsetNow * 60_000);

  const localTarget = new Date(
    Date.UTC(
      localNow.getUTCFullYear(),
      localNow.getUTCMonth(),
      localNow.getUTCDate(),
      targetHour,
      targetMinute,
      0,
      0
    )
  );
  if (localTarget.getTime() <= localNow.getTime()) {
    localTarget.setUTCDate(localTarget.getUTCDate() + 1);
  }

  const offsetAtTarget = offsetMinutesAt(
    new Date(localTarget.getTime() - offsetNow * 60_000),
    timezone
  );
  return new Date(localTarget.getTime() - offsetAtTarget * 60_000);
};
