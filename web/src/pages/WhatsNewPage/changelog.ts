export interface ChangelogEntry {
  type: 'feature' | 'fix' | 'style';
  title: string;
  date: string;
}

export const changelog: ChangelogEntry[] = [
  { type: 'fix', title: 'Stop emoji-triggered card reversal and improve conversion path', date: '2026-05-12' },
  { type: 'feature', title: 'Emoji feedback widget — rate your experience after every upload', date: '2026-05-12' },
  { type: 'feature', title: 'Feedback dashboard in /ops for tracking user sentiment', date: '2026-05-12' },
  { type: 'style', title: 'Redesign pass X — wider content, polished Notion and Import pages', date: '2026-05-12' },
  { type: 'style', title: 'Enforce 18px minimum font-size across all pages', date: '2026-05-12' },
  { type: 'fix', title: 'Persist Ankify welcome banner dismissal server-side', date: '2026-05-12' },
  { type: 'style', title: 'Rename Print to Print Decks in sidebar nav', date: '2026-05-12' },
  { type: 'feature', title: 'Revamp upload form into self-contained morphing zone', date: '2026-05-12' },
  { type: 'feature', title: 'Homepage showcase — Notion to Anki before/after preview', date: '2026-05-12' },
  { type: 'feature', title: 'Carousel navigation for Anki cards in showcase', date: '2026-05-12' },
  { type: 'feature', title: 'Render Notion toggle blocks with expand/collapse', date: '2026-05-12' },
  { type: 'feature', title: 'Login as text, compact theme toggle, per-conversion copy', date: '2026-05-12' },
  { type: 'feature', title: 'Showcase tab in /ops page', date: '2026-05-12' },
  { type: 'style', title: 'Redesign contact page, footer, and sidebar copyright', date: '2026-05-12' },
  { type: 'feature', title: 'Show PDF upload info explaining page-pair card creation', date: '2026-05-12' },
  { type: 'fix', title: 'Download headers and preserve card formatting', date: '2026-05-12' },
  { type: 'fix', title: 'Handle deleted Notion pages in polling and preview', date: '2026-05-12' },
  { type: 'feature', title: 'Rename Conversions to My Decks on downloads page', date: '2026-05-12' },
  { type: 'feature', title: 'Homepage funnel, limit banner, SEO, system theme', date: '2026-05-12' },
  { type: 'feature', title: 'Light, dark, gold, and purple theme switcher', date: '2026-05-12' },
  { type: 'style', title: 'Voice sweep — buttons, CTAs, errors, and helper text', date: '2026-05-12' },
  { type: 'style', title: 'Redesign Account and About pages, fix dark mode', date: '2026-05-12' },
  { type: 'style', title: 'Token consistency across 12 CSS files', date: '2026-05-12' },
  { type: 'style', title: 'Redesign NotFoundPage, AboutPage, and ContactPage', date: '2026-05-12' },
];
