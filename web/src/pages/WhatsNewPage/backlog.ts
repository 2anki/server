export interface BacklogItem {
  title: string;
  why?: string;
  issueUrl: string;
  type?: 'FEATURE' | 'FIX';
}

export const backlog: BacklogItem[] = [
  {
    title: 'Cloze deletions inside Notion table cells convert into cloze cards',
    issueUrl: 'https://github.com/2anki/server/issues/2450',
    type: 'FEATURE',
  },
  {
    title: 'Images inside Notion table cells appear in your cards',
    issueUrl: 'https://github.com/2anki/server/issues/2451',
    type: 'FIX',
  },
  {
    title: 'Per-column rules for Notion tables — map a column to a tag or deck name',
    why: 'Sort cards into the right decks automatically instead of doing it in Anki.',
    issueUrl: 'https://github.com/2anki/server/issues/2452',
    type: 'FEATURE',
  },
  {
    title: 'Account deletion uses an in-app modal instead of the browser popup',
    why: 'Consistent with the rest of the UI and easier to read on mobile.',
    issueUrl: 'https://github.com/2anki/server/issues/2360',
    type: 'FEATURE',
  },
  {
    title: 'ZIPs containing multiple password-protected PDFs convert in one upload',
    issueUrl: 'https://github.com/2anki/server/issues/2411',
    type: 'FEATURE',
  },
  {
    title: 'Basic Reversed and Type-the-answer starters in the Note Types gallery',
    why: 'Common card types available without building from scratch.',
    issueUrl: 'https://github.com/2anki/server/issues/2332',
    type: 'FEATURE',
  },
  {
    title: 'Image field back on Abhiyan Night Mode templates',
    issueUrl: 'https://github.com/2anki/server/issues/2330',
    type: 'FIX',
  },
];
