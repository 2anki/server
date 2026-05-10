import type { LandingCopy } from '../types';

const pdfCopy: LandingCopy = {
  pathname: '/pdf-to-anki',
  title: 'PDF to Anki — turn lecture notes into flashcards | 2anki',
  description:
    'Upload a PDF and get an Anki deck. Works with lecture slides, textbook chapters, and exported notes. No copy-pasting.',
  h1: 'Make Anki flashcards from a PDF',
  subhead: "Drop a PDF and we'll pull out the text you can turn into cards.",
  faqs: [
    {
      q: 'Will it read scanned PDFs?',
      a: 'Only if the scan has a text layer (OCR). Most modern textbooks and slide exports do. If yours is a photo of a page with no text layer, run it through an OCR tool first — macOS Preview and Adobe Acrobat both do this.',
    },
    {
      q: 'How does it pick what becomes a card?',
      a: "Headings become deck and tag names. Bullet points and short paragraphs become card fronts; the next line or indent becomes the back. You can edit the cards in Anki after — we don't lock anything down.",
    },
    {
      q: 'Can I upload a whole textbook?',
      a: 'Yes, but big PDFs take longer and can create huge decks. We recommend uploading one chapter at a time — easier to review, easier to share, and Anki handles 500-card decks better than 50,000-card ones.',
    },
    {
      q: 'What about diagrams and equations?',
      a: 'Diagrams come across as embedded images. Equations rendered as images stay images; equations stored as text need MathJax enabled in your Anki card template to display.',
    },
  ],
};

export default pdfCopy;
