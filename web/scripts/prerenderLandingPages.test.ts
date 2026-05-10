import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { emitLandingPages } from './prerenderLandingPages';
import notionCopy from '../src/pages/LandingPage/copy/notion';

let buildDir: string;

const SOURCE_INDEX = `<!DOCTYPE html>
<html>
<head>
  <link rel="canonical" href="https://2anki.net" />
  <title>Create Anki Flashcards - 2anki.net</title>
  <meta name="description" content="Original description">
</head>
<body>
  <div id="root"></div>
</body>
</html>`;

beforeEach(() => {
  buildDir = mkdtempSync(join(tmpdir(), '2anki-prerender-'));
  mkdirSync(buildDir, { recursive: true });
  writeFileSync(join(buildDir, 'index.html'), SOURCE_INDEX, 'utf8');
});

describe('emitLandingPages', () => {
  it('writes one HTML file per landing path', () => {
    const files = emitLandingPages(buildDir);
    expect(files).toHaveLength(4);
    expect(files.some((p) => p.endsWith('notion-to-anki/index.html'))).toBe(
      true
    );
    expect(files.some((p) => p.endsWith('quizlet-to-anki/index.html'))).toBe(
      true
    );
    expect(files.some((p) => p.endsWith('markdown-to-anki/index.html'))).toBe(
      true
    );
    expect(files.some((p) => p.endsWith('pdf-to-anki/index.html'))).toBe(true);
  });

  it('replaces the title with the per-route title', () => {
    emitLandingPages(buildDir);
    const html = readFileSync(
      join(buildDir, 'notion-to-anki', 'index.html'),
      'utf8'
    );
    expect(html).toContain(`<title>${notionCopy.title}</title>`);
  });

  it('replaces the description with the per-route description', () => {
    emitLandingPages(buildDir);
    const html = readFileSync(
      join(buildDir, 'notion-to-anki', 'index.html'),
      'utf8'
    );
    expect(html).toContain(
      `<meta name="description" content="${notionCopy.description}">`
    );
  });

  it('points the canonical link at the route URL', () => {
    emitLandingPages(buildDir);
    const html = readFileSync(
      join(buildDir, 'pdf-to-anki', 'index.html'),
      'utf8'
    );
    expect(html).toContain(
      '<link rel="canonical" href="https://2anki.net/pdf-to-anki">'
    );
  });

  it('inserts the H1 into the root div so bots without JS can index it', () => {
    emitLandingPages(buildDir);
    const html = readFileSync(
      join(buildDir, 'notion-to-anki', 'index.html'),
      'utf8'
    );
    expect(html).toContain(notionCopy.h1);
    expect(html).toContain('id="upload"');
  });

  it('adds OpenGraph and Twitter meta tags to the head', () => {
    emitLandingPages(buildDir);
    const html = readFileSync(
      join(buildDir, 'notion-to-anki', 'index.html'),
      'utf8'
    );
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta property="og:description"');
    expect(html).toContain('<meta name="twitter:title"');
  });
});
