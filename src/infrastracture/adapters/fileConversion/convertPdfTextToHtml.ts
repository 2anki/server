import { extractPdfText } from '../../../lib/parser/extractPdfText';
import { synthesizeCardsFromPdf } from '../../../lib/parser/synthesizeCardsFromPdf';
import path from 'path';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cardToToggle(front: string, back: string): string {
  const escapedFront = escapeHtml(front).replace(/\n/g, '<br>');
  const escapedBack = escapeHtml(back).replace(/\n/g, '<br>');
  return `<ul class="toggle">
  <li>
    <details>
      <summary>${escapedFront}</summary>
      <p>${escapedBack}</p>
    </details>
  </li>
</ul>`;
}

export interface ConvertPdfTextToHtmlResult {
  html: string;
  cardCount: number;
  isDrmLocked: boolean;
  needsCredential: boolean;
}

export async function convertPdfTextToHtml(
  buffer: Buffer,
  name: string,
  credential?: string
): Promise<ConvertPdfTextToHtmlResult> {
  const title = path.basename(name, path.extname(name));
  const extraction = await extractPdfText(buffer, credential);

  if (extraction.needsCredential) {
    return { html: '', cardCount: 0, isDrmLocked: false, needsCredential: true };
  }

  if (extraction.isDrmLocked) {
    return { html: '', cardCount: 0, isDrmLocked: true, needsCredential: false };
  }

  const cards = synthesizeCardsFromPdf(extraction.pages, title);

  const toggles = cards.map((c) => cardToToggle(c.front, c.back)).join('\n');
  const html = `<!DOCTYPE html>
<html>
<head><title>${escapeHtml(title)}</title></head>
<body>
${toggles}
</body>
</html>`;

  return { html, cardCount: cards.length, isDrmLocked: false, needsCredential: false };
}
