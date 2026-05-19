import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';

import { CardFrame } from './CardFrame';
import type { ApkgPreviewCard } from '../../lib/backend/getApkgPreview';

const buildCard = (overrides: Partial<ApkgPreviewCard> = {}): ApkgPreviewCard => ({
  id: 1,
  ord: 0,
  deckName: 'Sample Deck',
  deckPath: ['Sample Deck'],
  templateName: 'Basic',
  noteTypeName: 'Basic',
  front: 'Front content',
  back: 'Back content',
  css: 'body { color: #111; }',
  ...overrides,
});

const getSrcDoc = (container: HTMLElement): string => {
  const iframe = container.querySelector('iframe');
  if (iframe == null) throw new Error('iframe not rendered');
  return iframe.getAttribute('srcdoc') ?? '';
};

describe('CardFrame srcDoc sanitization', () => {
  it('strips <script> tags from card.front', () => {
    const card = buildCard({
      front: 'Hello<script>alert(1)</script> world',
    });
    const { container } = render(<CardFrame card={card} />);
    const srcDoc = getSrcDoc(container);
    expect(srcDoc).toContain('Hello');
    expect(srcDoc).toContain(' world');
    expect(srcDoc).not.toMatch(/<script/i);
    expect(srcDoc).not.toContain('alert(1)');
  });

  it('strips on* event handler attributes', () => {
    const card = buildCard({
      front: '<img src="x" onerror="alert(1)" /> <button onclick="boom()">go</button>',
    });
    const { container } = render(<CardFrame card={card} />);
    const srcDoc = getSrcDoc(container);
    expect(srcDoc).not.toMatch(/onerror/i);
    expect(srcDoc).not.toMatch(/onclick/i);
    expect(srcDoc).not.toContain('alert(1)');
    expect(srcDoc).not.toContain('boom()');
  });

  it('strips <script> hidden inside card.css', () => {
    const card = buildCard({
      css: 'body{color:red}</style><script>alert(2)</script><style>',
    });
    const { container } = render(<CardFrame card={card} />);
    const srcDoc = getSrcDoc(container);
    expect(srcDoc).not.toMatch(/<script/i);
    expect(srcDoc).not.toContain('alert(2)');
  });

  it('leaves benign markup intact', () => {
    const card = buildCard({
      front: '<p class="q"><strong>Q:</strong> What is spaced repetition?</p>',
    });
    const { container } = render(<CardFrame card={card} />);
    const srcDoc = getSrcDoc(container);
    expect(srcDoc).toContain('<p class="q">');
    expect(srcDoc).toContain('<strong>Q:</strong>');
  });
});
