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
    title: 'Notion images and media land in your deck intact',
    startedAt: '2026-05-19T09:58:01Z',
    type: 'FIX',
  },
  {
    title: 'More Notion page types convert cleanly into cards',
    startedAt: '2026-05-19T09:55:02Z',
    type: 'FIX',
  },
  {
    title: 'Yearly billing for Unlimited — pay once a year instead of monthly',
    startedAt: '2026-05-17T23:59:19Z',
    type: 'FEATURE',
  },
  {
    title: 'Recovery email if you start an upgrade and don’t finish',
    startedAt: '2026-05-19T06:56:04Z',
    type: 'FEATURE',
  },
];
