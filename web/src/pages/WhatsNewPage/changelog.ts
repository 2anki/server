export interface ChangelogEntry {
  type: 'feature' | 'fix' | 'style';
  title: string;
  date: string;
}

export const changelog: ChangelogEntry[] = [
  { type: 'feature', title: 'Image occlusion: draw masks on any image and export native Anki 23.10 cards — source images pull straight from Notion', date: '2026-05-14' },
  { type: 'feature', title: 'Chat study assistant: ask Claude questions about any deck and download the conversation as a .txt file', date: '2026-05-14' },
  { type: 'feature', title: 'Sign in with Notion: one-click login alongside Google and email', date: '2026-05-14' },
  { type: 'feature', title: 'Anki-to-Notion is free for everyone — higher PDF page limit and a dedicated landing page', date: '2026-05-13' },
  { type: 'feature', title: 'Try every Pro feature free for 1 hour — unlimited uploads, no card limit', date: '2026-05-13' },
  { type: 'fix', title: 'Contact form works again — file attachments now supported too', date: '2026-05-13' },
  { type: 'feature', title: 'Share your experience — tell us what you study and what gets in your way', date: '2026-05-13' },
  { type: 'feature', title: 'Rate us 😠 or 😕 after an upload and we\'ll ask for the details', date: '2026-05-13' },
  { type: 'fix', title: 'Card order no longer flips when using the emoji rating', date: '2026-05-12' },
  { type: 'feature', title: 'Rate your experience right after your deck is ready', date: '2026-05-12' },
  { type: 'feature', title: 'Upload form redesigned — converts and downloads without leaving the page', date: '2026-05-12' },
  { type: 'feature', title: 'See a live Notion-to-Anki example on the homepage', date: '2026-05-12' },
  { type: 'feature', title: 'Browse converted Anki cards in a carousel on the homepage', date: '2026-05-12' },
  { type: 'feature', title: 'Notion toggle blocks now expand and collapse in your deck', date: '2026-05-12' },
  { type: 'feature', title: 'Converting a PDF? We now explain how page-pair cards are created', date: '2026-05-12' },
  { type: 'feature', title: 'Downloads page renamed to My Decks', date: '2026-05-12' },
  { type: 'feature', title: 'Theme switcher — light, dark, gold, and purple', date: '2026-05-12' },
  { type: 'fix', title: 'Download file headers fixed — card formatting preserved correctly', date: '2026-05-12' },
  { type: 'fix', title: 'Deleted Notion pages no longer break your Auto Sync', date: '2026-05-12' },
  { type: 'style', title: 'Wider content area, polished Notion and Import pages', date: '2026-05-12' },
  { type: 'style', title: 'Contact page, footer, and sidebar redesigned', date: '2026-05-12' },
  { type: 'style', title: 'Account and About pages redesigned with dark mode fixes', date: '2026-05-12' },
];
