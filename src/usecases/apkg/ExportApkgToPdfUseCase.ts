import ApkgPreviewService, {
  ParsedApkg,
} from '../../services/ApkgPreviewService/ApkgPreviewService';
import PdfRenderService from '../../services/PdfRenderService';
import { RenderedCard } from '../../services/ApkgPreviewService/types';

const MAX_CARDS = 500;

const SOUND_TAG_REGEX = /\[sound:([^\]]+)\]/g;
const AUDIO_EXTENSIONS = new Set([
  'mp3', 'ogg', 'oga', 'wav', 'flac', 'm4a', 'aac', 'opus',
]);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov']);

const IMAGE_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isAudioOrVideo(name: string): boolean {
  const ext = extensionOf(name);
  return AUDIO_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
}

function replaceSoundTokens(html: string): string {
  return html.replace(SOUND_TAG_REGEX, (_match, name: string) => {
    const trimmed = name.trim();
    return `<em>[audio: ${escapeHtml(trimmed)}]</em>`;
  });
}

function replaceMediaWithBase64(
  html: string,
  parsed: ParsedApkg
): string {
  const SRC_REGEX = /\b(src)="([^"]+)"/g;
  return html.replace(SRC_REGEX, (_match, attr: string, value: string) => {
    if (value.startsWith('data:') || /^https?:\/\//i.test(value)) {
      return `${attr}="${value}"`;
    }
    const decoded = decodeURIComponent(value);
    const nameOnly = decoded.split('/').pop() ?? decoded;

    if (isAudioOrVideo(nameOnly)) {
      return `${attr}=""`;
    }

    const archiveName = parsed.mediaMap.get(nameOnly);
    if (archiveName == null) {
      return `${attr}=""`;
    }
    const buffer = parsed.mediaEntries.get(archiveName);
    if (buffer == null) {
      return `${attr}=""`;
    }
    const ext = extensionOf(nameOnly);
    const mime = IMAGE_MIME[ext] ?? 'application/octet-stream';
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
    return `${attr}="${dataUri}"`;
  });
}

function replaceMissingMediaPlaceholders(html: string): string {
  return html.replace(
    /data-missing-media="([^"]+)"/g,
    (_match, name: string) => {
      if (isAudioOrVideo(name)) {
        return '';
      }
      return '';
    }
  );
}

function processCardHtml(side: string, parsed: ParsedApkg): string {
  let result = replaceSoundTokens(side);
  result = replaceMediaWithBase64(result, parsed);
  result = replaceMissingMediaPlaceholders(result);
  return result;
}

function buildCardRow(card: RenderedCard, parsed: ParsedApkg): string {
  const front = processCardHtml(card.front, parsed);
  const back = processCardHtml(card.back, parsed);
  return `<tr>
    <td class="card-cell"><style scoped>${card.css}</style><div class="card-content">${front}</div></td>
    <td class="card-cell"><style scoped>${card.css}</style><div class="card-content">${back}</div></td>
  </tr>`;
}

function collectAllCards(
  previewService: ApkgPreviewService,
  parsed: ParsedApkg
): RenderedCard[] {
  const all: RenderedCard[] = [];
  let cursor = 0;
  const pageSize = 100;
  const mediaBaseUrl = '';
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    const page = previewService.getCardsPage(parsed, cursor, pageSize, mediaBaseUrl);
    all.push(...page.cards);
    if (page.nextCursor == null) break;
    cursor = page.nextCursor;
  }
  return all;
}

function buildHtml(deckName: string, cards: RenderedCard[], parsed: ParsedApkg): string {
  const rows = cards.map((card) => buildCardRow(card, parsed)).join('\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(deckName)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; }
  h1 { font-size: 18px; margin: 16px 0 8px; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  th { text-align: left; font-size: 12px; padding: 6px 10px; border-bottom: 2px solid #333; }
  .card-cell { width: 50%; padding: 10px; border: 1px solid #ddd; vertical-align: top; word-wrap: break-word; overflow: hidden; }
  .card-content { font-size: 13px; line-height: 1.5; }
  .card-content img { max-width: 100%; height: auto; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
<script>
window.MathJax = {
  tex: { inlineMath: [['\\\\(','\\\\)'], ['$','$']], displayMath: [['\\\\[','\\\\]'], ['$$','$$']] },
  startup: { typeset: true }
};
</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" async></script>
</head>
<body>
<h1>${escapeHtml(deckName)}</h1>
<table>
<thead><tr><th>Front</th><th>Back</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</body>
</html>`;
}

export interface ExportApkgToPdfResult {
  pdf: Buffer;
  deckName: string;
  cardCount: number;
}

export default class ExportApkgToPdfUseCase {
  constructor(
    private readonly previewService: ApkgPreviewService,
    private readonly pdfRenderService: PdfRenderService
  ) {}

  async execute(fileBuffer: Buffer): Promise<ExportApkgToPdfResult> {
    const cacheKey = `pdf-export:${Date.now()}`;
    const parsed = await this.previewService.parse(cacheKey, fileBuffer);
    const meta = this.previewService.getMeta(parsed);

    if (meta.totalCards > MAX_CARDS) {
      throw new CardLimitExceededError(meta.totalCards);
    }

    const cards = collectAllCards(this.previewService, parsed);
    const deckName =
      meta.decks.length > 0 ? meta.decks[0].fullName : 'Flashcards';
    const html = buildHtml(deckName, cards, parsed);
    const pdf = await this.pdfRenderService.renderHtml(html);
    return { pdf, deckName, cardCount: cards.length };
  }
}

export class CardLimitExceededError extends Error {
  constructor(public readonly cardCount: number) {
    super(
      `This deck has ${cardCount} cards. PDF export supports up to ${MAX_CARDS} cards.`
    );
    this.name = 'CardLimitExceededError';
  }
}
