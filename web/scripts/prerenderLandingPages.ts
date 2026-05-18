import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import notionCopy from '../src/pages/LandingPage/copy/notion';
import quizletCopy from '../src/pages/LandingPage/copy/quizlet';
import markdownCopy from '../src/pages/LandingPage/copy/markdown';
import pdfCopy from '../src/pages/LandingPage/copy/pdf';
import type { LandingCopy } from '../src/pages/LandingPage/types';

const LANDING_COPIES: LandingCopy[] = [
  notionCopy,
  quizletCopy,
  markdownCopy,
  pdfCopy,
];

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function buildHeroFragment(copy: LandingCopy): string {
  return [
    '<section id="upload" style="background:#f9fafb;padding:4rem 1.5rem;">',
    '<div style="max-width:720px;margin:0 auto;">',
    `<h1 style="margin:0 0 1rem;font-size:2.5rem;font-weight:600;max-width:18ch;">${escapeHtml(
      copy.h1
    )}</h1>`,
    `<p style="margin:0 0 2rem;color:#4b5563;">${escapeHtml(copy.subhead)}</p>`,
    '</div>',
    '</section>',
  ].join('');
}

const REPLACED_OG_PROPERTIES = ['og:title', 'og:description', 'og:url', 'og:type'];
const REPLACED_TWITTER_NAMES = ['twitter:title', 'twitter:description'];

function stripExistingMeta(html: string): string {
  let next = html;
  for (const property of REPLACED_OG_PROPERTIES) {
    const pattern = new RegExp(
      `\\s*<meta\\s+property="${property}"[^>]*>`,
      'g'
    );
    next = next.replace(pattern, '');
  }
  for (const name of REPLACED_TWITTER_NAMES) {
    const pattern = new RegExp(`\\s*<meta\\s+name="${name}"[^>]*>`, 'g');
    next = next.replace(pattern, '');
  }
  return next;
}

function rewriteHead(html: string, copy: LandingCopy): string {
  const canonical = `https://2anki.net${copy.pathname}`;
  const titleTag = `<title>${escapeHtml(copy.title)}</title>`;
  const descriptionTag = `<meta name="description" content="${escapeHtml(
    copy.description
  )}">`;
  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(copy.title)}">`,
    `<meta property="og:description" content="${escapeHtml(
      copy.description
    )}">`,
    `<meta property="og:url" content="${canonical}">`,
    '<meta property="og:type" content="website">',
    `<meta name="twitter:title" content="${escapeHtml(copy.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(
      copy.description
    )}">`,
  ].join('\n  ');

  let next = html.replace(/<title>[\s\S]*?<\/title>/, titleTag);
  next = next.replace(
    /<meta\s+name="description"[^>]*>/,
    descriptionTag
  );
  next = next.replace(
    /<link\s+rel="canonical"[^>]*>/,
    `<link rel="canonical" href="${canonical}">`
  );
  next = stripExistingMeta(next);
  next = next.replace(
    /<\/head>/,
    `  ${ogTags}\n</head>`
  );
  return next;
}

function rewriteRoot(html: string, copy: LandingCopy): string {
  const hero = buildHeroFragment(copy);
  return html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${hero}</div>`
  );
}

const NOTION_MARKETPLACE_META = {
  pathname: '/notion-marketplace',
  title: 'Notion to Anki — automatic sync | 2anki',
  description:
    'Connect your Notion workspace and your notes become Anki flashcards automatically. No exports, no zips. Auto Sync $30/mo, Unlimited $6/mo.',
  h1: 'Your Notion notes become Anki cards — automatically',
  subhead: 'Connect your workspace in 5 minutes. No exports, no zips, no manual steps.',
};

function buildNotionMarketplaceFragment(): string {
  return [
    '<section style="padding:4rem 1.5rem 3rem;text-align:center;">',
    '<div style="max-width:720px;margin:0 auto;">',
    `<h1 style="margin:0 0 1rem;font-size:2.5rem;font-weight:700;max-width:20ch;margin-left:auto;margin-right:auto;">${escapeHtml(NOTION_MARKETPLACE_META.h1)}</h1>`,
    `<p style="margin:0 0 2rem;color:#4b5563;font-size:1.125rem;">${escapeHtml(NOTION_MARKETPLACE_META.subhead)}</p>`,
    '</div>',
    '</section>',
  ].join('');
}

export function emitNotionMarketplacePage(buildDir: string): string {
  const meta = NOTION_MARKETPLACE_META;
  const indexPath = join(buildDir, 'index.html');
  const source = readFileSync(indexPath, 'utf8');
  const canonical = `https://2anki.net${meta.pathname}`;
  const slug = meta.pathname.replace(/^\//, '');
  const outDir = join(buildDir, slug);
  const outPath = join(outDir, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });

  const titleTag = `<title>${escapeHtml(meta.title)}</title>`;
  const descriptionTag = `<meta name="description" content="${escapeHtml(meta.description)}">`;
  const ogTags = [
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${canonical}">`,
    '<meta property="og:type" content="website">',
  ].join('\n  ');

  let html = source.replace(/<title>[\s\S]*?<\/title>/, titleTag);
  html = html.replace(/<meta\s+name="description"[^>]*>/, descriptionTag);
  html = html.replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}">`);
  html = stripExistingMeta(html);
  html = html.replace(/<\/head>/, `  ${ogTags}\n</head>`);
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${buildNotionMarketplaceFragment()}</div>`
  );

  writeFileSync(outPath, html, 'utf8');
  return outPath;
}

export function emitLandingPages(buildDir: string): string[] {
  const indexPath = join(buildDir, 'index.html');
  const source = readFileSync(indexPath, 'utf8');
  const emitted: string[] = [];

  for (const copy of LANDING_COPIES) {
    const slug = copy.pathname.replace(/^\//, '');
    const outDir = join(buildDir, slug);
    const outPath = join(outDir, 'index.html');
    mkdirSync(dirname(outPath), { recursive: true });
    const html = rewriteRoot(rewriteHead(source, copy), copy);
    writeFileSync(outPath, html, 'utf8');
    emitted.push(outPath);
  }
  return emitted;
}

if (process.argv[1] && process.argv[1].endsWith('prerenderLandingPages.ts')) {
  const buildDir = join(process.cwd(), 'build');
  const files = emitLandingPages(buildDir);
  for (const file of files) {
    process.stdout.write(`prerendered ${file}\n`);
  }
  const marketplacePage = emitNotionMarketplacePage(buildDir);
  process.stdout.write(`prerendered ${marketplacePage}\n`);
}
