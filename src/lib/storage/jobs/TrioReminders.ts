import { IEmailService } from '../../../services/EmailService/EmailService';

const ONE_HOUR_MS = 60 * 60 * 1000;
const TIMEZONE = 'Europe/Oslo';
const RETRO_DAY = 'Sunday';
const RETRO_HOUR = 18;
const FRIDAY = 'Friday';
const FRIDAY_HOUR = 9;

type OsloDateParts = {
  weekday: string;
  hour: number;
  year: number;
  month: number;
  day: number;
};

const getOsloDateParts = (now: Date): OsloDateParts => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    weekday: get('weekday'),
    hour: Number.parseInt(get('hour'), 10),
    year: Number.parseInt(get('year'), 10),
    month: Number.parseInt(get('month'), 10),
    day: Number.parseInt(get('day'), 10),
  };
};

const getISOWeek = (year: number, month: number, day: number): number => {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const handleFridayReminder = (
  emailService: IEmailService,
  now: Date = new Date()
): Promise<void> => {
  const oslo = getOsloDateParts(now);
  const week = getISOWeek(oslo.year, oslo.month, oslo.day);
  if (week % 2 === 0) {
    return emailService.sendTriageFeedbackReminder();
  }
  return emailService.sendChangelogReminder();
};

type FiredKey = 'retro' | 'friday';
type LastFired = Map<FiredKey, string>;

export const handleHourlyTick = async (
  emailService: IEmailService,
  lastFired: LastFired,
  now: Date = new Date()
): Promise<void> => {
  const oslo = getOsloDateParts(now);
  const dateKey = `${oslo.year}-${oslo.month}-${oslo.day}`;

  if (
    oslo.weekday === RETRO_DAY &&
    oslo.hour === RETRO_HOUR &&
    lastFired.get('retro') !== dateKey
  ) {
    lastFired.set('retro', dateKey);
    await emailService.sendWeeklyRetroReminder();
    return;
  }

  if (
    oslo.weekday === FRIDAY &&
    oslo.hour === FRIDAY_HOUR &&
    lastFired.get('friday') !== dateKey
  ) {
    lastFired.set('friday', dateKey);
    await handleFridayReminder(emailService, now);
  }
};

export const ScheduleTrioReminders = (emailService: IEmailService) => {
  const lastFired: LastFired = new Map();
  const tick = () =>
    handleHourlyTick(emailService, lastFired).catch((error) =>
      console.error('Trio reminder tick failed:', error)
    );
  tick();
  setInterval(tick, ONE_HOUR_MS);
};
