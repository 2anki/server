export interface AnswerSection {
  heading: string;
  body: string;
}

export interface AnswerConfig {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: AnswerSection[];
  relatedLinks: ReadonlyArray<{ label: string; href: string }>;
}

const convertNotionToAnki: AnswerConfig = {
  slug: 'convert-notion-to-anki',
  title: 'How to convert Notion to Anki flashcards | 2anki',
  description:
    'Step-by-step guide to converting Notion pages into Anki flashcard decks. Connect Notion once, paste a page link, download a .apkg file.',
  h1: 'How to convert Notion to Anki flashcards',
  intro:
    'Notion stores your notes. Anki turns them into a review system. 2anki bridges the gap — you get a .apkg deck from any Notion page in under a minute.',
  sections: [
    {
      heading: 'Format your Notion page for cards',
      body: 'Toggle blocks are the primary card source. The toggle heading becomes the front of the card; the content inside becomes the back. Nest one level of toggles inside another to create subdecks. Strikethrough text anywhere on the page becomes a tag applied to every card in that deck.',
    },
    {
      heading: 'Connect Notion and convert',
      body: 'Sign in to 2anki, go to the upload page, and click "Connect Notion". Authorise read access once — 2anki only reads pages you select. Paste a Notion page URL, click Convert, and download the .apkg file. Open it in Anki with a double-click.',
    },
    {
      heading: 'What comes across',
      body: 'Images embed directly in cards. Code blocks keep their formatting. Audio files attach to the card. Equations stored as images appear as images; equations stored as LaTeX text render if MathJax is enabled in your Anki card template. Anything that cannot be fetched is replaced with a short note so the card still works.',
    },
    {
      heading: 'Re-convert after editing',
      body: 'Paste the same page URL again to get a fresh deck reflecting your edits. For edits to sync automatically every 5 minutes without manual steps, use Auto Sync ($30/month).',
    },
    {
      heading: 'Use a Notion export instead',
      body: 'Export your Notion page as HTML (from the Notion desktop app: Export → HTML) and upload the .zip file to 2anki. This path works without an OAuth connection and supports the full export including images.',
    },
  ],
  relatedLinks: [
    { label: 'Auto Sync — automatic Notion to Anki sync', href: '/answers/notion-to-anki-sync?ref=ai' },
    { label: 'Pricing', href: '/pricing?ref=ai' },
    { label: '/convert/notion-to-anki', href: '/convert/notion-to-anki?ref=ai' },
  ],
};

const notionToAnkiSync: AnswerConfig = {
  slug: 'notion-to-anki-sync',
  title: 'Notion to Anki automatic sync — how Auto Sync works | 2anki',
  description:
    'Auto Sync keeps your Anki decks up to date as you edit Notion. Connect once, edit in Notion, study in Anki — no manual exports.',
  h1: 'Notion to Anki automatic sync',
  intro:
    'Auto Sync watches your connected Notion pages and pushes changes to your Anki decks every 5 minutes. Edit a toggle in Notion; the card updates in Anki before your next review session.',
  sections: [
    {
      heading: 'How it works',
      body: '2anki polls the pages you have connected every 5 minutes. When it detects changes, it rebuilds the affected deck and queues it for the next sync. Anki picks up the updated .apkg the next time it syncs with AnkiWeb.',
    },
    {
      heading: 'Set up Auto Sync',
      body: 'Subscribe to Auto Sync ($30/month) at 2anki.net/pricing. Then go to 2anki.net/ankify/setup, connect your Notion workspace, and select the pages to watch. The first sync runs within 5 minutes.',
    },
    {
      heading: 'Card format requirements',
      body: 'Auto Sync reads the same toggle structure as one-off conversions. Toggle heading → card front. Toggle body → card back. Strikethrough text → tag. Keep your Notion pages in this shape and every edit flows through automatically.',
    },
    {
      heading: 'Difference from one-off conversion',
      body: 'One-off conversion: paste a URL, download a .apkg, import manually. Auto Sync: connect once, edits propagate automatically. Auto Sync is the right choice if you update your Notion notes regularly and want your Anki deck to stay current without manual steps.',
    },
  ],
  relatedLinks: [
    { label: 'How to convert Notion to Anki', href: '/answers/convert-notion-to-anki?ref=ai' },
    { label: 'Auto Sync pricing', href: '/pricing?ref=ai' },
    { label: 'Auto Sync setup', href: '/ankify/setup?ref=ai' },
  ],
};

const pdfToAnki: AnswerConfig = {
  slug: 'pdf-to-anki',
  title: 'How to convert a PDF to Anki flashcards | 2anki',
  description:
    'Upload a PDF and get an Anki deck. Headings name the deck and subdecks, bullets become card fronts, and the next line becomes the answer.',
  h1: 'How to convert a PDF to Anki flashcards',
  intro:
    'Upload a PDF to 2anki and download a .apkg deck. Works with lecture slides, textbook chapters, and any PDF with a text layer.',
  sections: [
    {
      heading: 'What the converter needs',
      body: 'The PDF must have a text layer — most modern textbook exports, slide PDFs exported from PowerPoint or Keynote, and lecture notes do. Scanned images with no text layer will not produce cards. Run a scanned PDF through OCR in macOS Preview or Adobe Acrobat first.',
    },
    {
      heading: 'How cards are built',
      body: 'Headings in the PDF name the deck and subdecks. Top-level bullets become card fronts; the next indent level or line becomes the back. Diagrams come across as embedded images. Equations stored as images appear as images; LaTeX equations render if MathJax is enabled in your Anki card template.',
    },
    {
      heading: 'Convert a PDF',
      body: 'Go to 2anki.net, drag your PDF onto the upload area, and click Convert. Download the .apkg file and open it in Anki with a double-click. No account required for PDFs under the free plan limit.',
    },
    {
      heading: 'Large PDFs and textbooks',
      body: 'Large PDFs work — a whole textbook uploads fine. Big files take longer and create large decks. Uploading one chapter at a time keeps decks easier to review and share. The free plan covers 100 cards per month; the Unlimited plan ($6/month) has no card limit.',
    },
  ],
  relatedLinks: [
    { label: 'PDF to Anki converter', href: '/convert/pdf-to-anki?ref=ai' },
    { label: 'Pricing — Unlimited plan', href: '/pricing?ref=ai' },
    { label: 'How to convert Notion to Anki', href: '/answers/convert-notion-to-anki?ref=ai' },
  ],
};

const quizletToAnki: AnswerConfig = {
  slug: 'quizlet-to-anki',
  title: 'How to move from Quizlet to Anki | 2anki',
  description:
    'Export your Quizlet sets and import them into Anki via 2anki. Keep your existing cards and study them with spaced repetition in Anki.',
  h1: 'How to move from Quizlet to Anki',
  intro:
    'Quizlet stores your sets. Anki gives you a proper spaced repetition algorithm. 2anki converts a Quizlet export into a .apkg deck you can open in Anki directly.',
  sections: [
    {
      heading: 'Export your Quizlet set',
      body: 'Open the set in Quizlet. Click the three-dot menu and choose Export. Select the tab-separated format (TSV). Save the file — it downloads as a .txt file.',
    },
    {
      heading: 'Convert and import',
      body: 'Go to 2anki.net, drag the exported .txt file onto the upload area, and click Convert. Download the .apkg file and open it in Anki with a double-click. Your cards appear as a new deck.',
    },
    {
      heading: 'What carries over',
      body: 'Terms and definitions carry over as card fronts and backs. Images embedded in a Quizlet set do not export in the standard TSV format — only text transfers. For image-heavy sets, copy the images manually into the Anki card editor after import.',
    },
    {
      heading: 'Why Anki over Quizlet',
      body: 'Anki uses the SM-2 spaced repetition algorithm, which schedules cards based on how well you remember them. This means you review difficult cards more often and easy cards less often — more efficient than fixed review cycles. Anki works offline, syncs across devices via AnkiWeb, and the core app is free.',
    },
  ],
  relatedLinks: [
    { label: 'Quizlet to Anki converter', href: '/quizlet-to-anki?ref=ai' },
    { label: 'How to convert Notion to Anki', href: '/answers/convert-notion-to-anki?ref=ai' },
    { label: 'Pricing', href: '/pricing?ref=ai' },
  ],
};

export const ANSWERS_PAGES: ReadonlyMap<string, AnswerConfig> = new Map([
  ['convert-notion-to-anki', convertNotionToAnki],
  ['notion-to-anki-sync', notionToAnkiSync],
  ['pdf-to-anki', pdfToAnki],
  ['quizlet-to-anki', quizletToAnki],
]);
