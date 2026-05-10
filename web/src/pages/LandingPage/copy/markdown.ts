import type { LandingCopy } from '../types';

const markdownCopy: LandingCopy = {
  pathname: '/markdown-to-anki',
  title: 'Markdown to Anki — convert .md files to decks | 2anki',
  description:
    'Convert a Markdown file into an Anki deck. Headings become tags, lists become cards, code blocks keep their formatting.',
  h1: 'Turn Markdown notes into Anki cards',
  subhead:
    'Drop a .md file and download a deck — headings, lists, and code all come across.',
  faqs: [
    {
      q: 'How are cards made from my Markdown?',
      a: "Each top-level bullet becomes a card. A nested bullet underneath is the answer. Headings above the list become the deck name and tags. There's a full guide in the docs.",
    },
    {
      q: 'Can I use my own card template?',
      a: "Yes — .md files with YAML frontmatter or HTML <style> blocks pass through. If you want question/answer pairs in a specific format, write them as 'Q: ... / A: ...' and we'll detect it.",
    },
    {
      q: 'Does it handle code blocks and LaTeX?',
      a: 'Triple-backtick code blocks keep their language and formatting in Anki. LaTeX inside $...$ and $$...$$ renders if you have MathJax enabled in Anki — turn it on in card template settings.',
    },
    {
      q: 'What if my file has thousands of bullets?',
      a: "We'll convert all of them. Big files take longer — usually under a minute for 1,000 cards. If the file is over 50MB, split it first or upload a zip of smaller files.",
    },
  ],
};

export default markdownCopy;
