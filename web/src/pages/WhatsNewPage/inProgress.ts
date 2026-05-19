export interface InProgressItem {
  title: string;
  startedAt: string;
  type?: 'FEATURE' | 'FIX';
}

export const inProgress: InProgressItem[] = [
  {
    title: 'Re-imports update existing cards instead of creating duplicates in Anki',
    startedAt: '2026-05-19T09:58:01Z',
    type: 'FIX',
  },
  {
    title: 'Images and media inside Notion pages carry through to your deck without breaking',
    startedAt: '2026-05-19T09:58:01Z',
    type: 'FIX',
  },
  {
    title: 'Yearly billing for Unlimited — pay once a year instead of monthly',
    startedAt: '2026-05-17T23:59:19Z',
    type: 'FEATURE',
  },
  {
    title: 'Abandoned-checkout recovery — get a follow-up if you left before completing an upgrade',
    startedAt: '2026-05-19T06:56:04Z',
    type: 'FEATURE',
  },
  {
    title: 'Notion path conversion audited — more page types convert cleanly into cards',
    startedAt: '2026-05-19T09:55:02Z',
    type: 'FIX',
  },
];
