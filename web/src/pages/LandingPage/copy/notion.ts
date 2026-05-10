import type { LandingCopy } from '../types';

const notionCopy: LandingCopy = {
  pathname: '/notion-to-anki',
  title: 'Notion to Anki — convert pages to flashcards | 2anki',
  description:
    'Turn a Notion page into an Anki deck in seconds. Paste a link, get a .apkg file, study in Anki. Free for one deck at a time.',
  h1: 'Turn a Notion page into Anki flashcards',
  subhead: 'Paste a Notion link and get a deck you can open in Anki.',
  faqs: [
    {
      q: 'Does this work with toggles and callouts?',
      a: "Yes. Toggles become front/back cards. Strikethrough text in the page body becomes a tag on every card in that deck. If a block type isn't handled the way you'd like, send the page to support@2anki.net and we'll take a look.",
    },
    {
      q: 'Do I need a Notion integration token?',
      a: "Yes — connect Notion once on the upload page. We use the token only to read the pages you pick, and you can revoke it from your Notion settings any time.",
    },
    {
      q: 'What happens to images and code blocks?',
      a: "Both come across. Images embed in the card, code blocks keep their formatting. Anything we can't fetch is replaced with a short note so the card still works.",
    },
    {
      q: 'Will it sync when I edit the Notion page later?',
      a: 'A one-time conversion is a snapshot. Re-paste the link to make a fresh deck. If you want changes to flow automatically, see Hosted Anki on the pricing page — it polls Notion every few minutes.',
    },
  ],
};

export default notionCopy;
