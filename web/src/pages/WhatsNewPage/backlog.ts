export interface BacklogItem {
  title: string;
  why?: string;
  issueUrl: string;
  type?: 'FEATURE' | 'FIX';
}

export const backlog: BacklogItem[] = [
  {
    title: 'Per-column rules for Notion tables — map a column to a tag or deck name',
    why: 'Sort cards into the right decks automatically instead of doing it in Anki.',
    issueUrl: 'https://github.com/2anki/server/issues/2452',
    type: 'FEATURE',
  },
  {
    title: 'Images inside Notion table cells appear in your cards',
    issueUrl: 'https://github.com/2anki/server/issues/2451',
    type: 'FIX',
  },
  {
    title: 'Cloze deletions inside Notion table cells convert into cloze cards',
    issueUrl: 'https://github.com/2anki/server/issues/2450',
    type: 'FEATURE',
  },
  {
    title: 'Replace browser confirm dialogs with in-app modals — account deletion included',
    why: 'Consistent with the rest of the UI and avoids browser-level interruptions.',
    issueUrl: 'https://github.com/2anki/server/issues/2360',
    type: 'FIX',
  },
  {
    title: 'Basic Reversed and Type-the-answer starters in the Note Types gallery',
    why: 'Common card types available without building from scratch.',
    issueUrl: 'https://github.com/2anki/server/issues/2332',
    type: 'FEATURE',
  },
  {
    title: 'ZIPs containing multiple password-protected PDFs convert in one upload',
    issueUrl: 'https://github.com/2anki/server/issues/2411',
    type: 'FEATURE',
  },
  {
    title: 'Image field back on Abhiyan Night Mode templates',
    issueUrl: 'https://github.com/2anki/server/issues/2330',
    type: 'FIX',
  },
];
