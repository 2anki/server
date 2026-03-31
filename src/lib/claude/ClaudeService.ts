const SYSTEM_PROMPT = `
You are an Anki flashcard generator. Output ONLY a compact JSON array.

Format (nothing else — no markdown, no explanation):
[{"deck":"Deck Name","cards":[{"q":"front HTML","a":"back HTML"}]}]

Optional card fields (omit when not applicable):
- "tags": string[]    — topic tags
- "cloze": true       — only when front contains {{c1::...}} syntax
- "media": string[]   — only local filenames that appear in the Available media files list

Extraction rules:
- HTML <details>/<summary>: <summary> text = q, sibling content = a
- Heading followed by paragraph: heading = q, paragraph = a
- Bold term + definition: term = q, definition = a
- Inline <code> in q: rewrite as {{c1::code}} and set "cloze": true
- Preserve HTML formatting in q and a
- Never invent content — only use text present in the document
`.trim();

import * as cheerio from 'cheerio';

function stripHtmlBoilerplate(html: string): string {
  const $ = cheerio.load(html);
  $('style, script, head, link[rel="stylesheet"]').remove();
  $('[style]').removeAttr('style');
  const body = $('body');
  return body.length ? body.html() ?? '' : $.html();
}

interface CompactCard {
  q: string;
  a: string;
  tags?: string[];
  cloze?: boolean;
  media?: string[];
}

interface CompactDeck {
  deck: string;
  cards: CompactCard[];
}

export interface DeckInfo {
  name: string;
  image: string;
  style: null | string;
  id: number;
  settings: Record<string, unknown>;
  cards: CardInfo[];
}

export interface CardInfo {
  name: string;
  back: string;
  tags: string[];
  cloze: boolean;
  number: number;
  enableInput: boolean;
  answer: string;
  media: string[];
}

function expandCompactDeckInfo(compact: CompactDeck[]): DeckInfo[] {
  return compact.map((d) => ({
    name: d.deck,
    image: '',
    style: null,
    id: Math.floor(Math.random() * 1e15),
    settings: {
      template: 'specialstyle',
      clozeModelName: 'n2a-cloze',
      basicModelName: 'n2a-basic',
      inputModelName: 'n2a-input',
      useNotionId: true,
    },
    cards: d.cards.map((c) => ({
      name: c.q,
      back: c.a,
      tags: c.tags ?? [],
      cloze: c.cloze ?? false,
      number: 0,
      enableInput: false,
      answer: '',
      media: c.media ?? [],
    })),
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _anthropicClient: any = null;

function getAnthropicClient() {
  if (!_anthropicClient) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Anthropic = require('@anthropic-ai/sdk').default;
    _anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
    });
  }
  return _anthropicClient;
}

export async function generateDeckInfo(
  htmlContent: string,
  availableMediaFiles: string[],
  userInstructions?: string
): Promise<DeckInfo[]> {
  const t0 = Date.now();
  const client = getAnthropicClient();

  const tStrip0 = Date.now();
  const strippedContent = stripHtmlBoilerplate(htmlContent);
  console.log('[Claude] stripHtmlBoilerplate', {
    originalBytes: htmlContent.length,
    strippedBytes: strippedContent.length,
    savedBytes: htmlContent.length - strippedContent.length,
    savedPct: (((htmlContent.length - strippedContent.length) / htmlContent.length) * 100).toFixed(1) + '%',
    durationMs: Date.now() - tStrip0,
  });

  const mediaFilesList =
    availableMediaFiles.length > 0
      ? `\n\nAvailable local media files:\n${availableMediaFiles.map((f) => `- ${f}`).join('\n')}`
      : '';

  const instructionsSection = userInstructions?.trim()
    ? `\n\nAdditional instructions:\n${userInstructions.trim()}`
    : '';

  const userMessage = `Convert this HTML content into the compact deck JSON:\n\n${strippedContent}${mediaFilesList}${instructionsSection}`;

  const maxTokens = strippedContent.length > 20000 ? 16384 : 4096;

  console.log('[Claude] Sending request to Claude API', {
    model: 'claude-sonnet-4-5',
    promptBytes: userMessage.length,
    maxTokens,
    mediaFilesCount: availableMediaFiles.length,
    hasUserInstructions: !!userInstructions?.trim(),
  });

  const tApi0 = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: maxTokens,
    system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: userMessage }],
  } as any);
  const apiMs = Date.now() - tApi0;

  console.log('[Claude] Received response', {
    stopReason: response.stop_reason,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
    cacheCreationTokens: response.usage?.cache_creation_input_tokens,
    cacheReadTokens: response.usage?.cache_read_input_tokens,
    apiDurationMs: apiMs,
    tokensPerSecond: response.usage?.output_tokens
      ? Math.round((response.usage.output_tokens / apiMs) * 1000)
      : null,
  });

  const raw = (response.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  const cleaned = raw.replace(/```json|```/g, '').trim();

  const tParse0 = Date.now();
  try {
    const compact = JSON.parse(cleaned) as CompactDeck[];
    const deckInfo = expandCompactDeckInfo(compact);
    const totalCards = deckInfo.reduce((sum, deck) => sum + deck.cards.length, 0);
    console.log('[Claude] Successfully parsed deck_info', {
      decksCount: deckInfo.length,
      totalCards,
      compactOutputBytes: cleaned.length,
      parseMs: Date.now() - tParse0,
      totalMs: Date.now() - t0,
    });
    return deckInfo;
  } catch {
    console.error('[Claude] Failed to parse response as JSON', { raw });
    throw new Error(`Claude returned invalid JSON:\n${raw}`);
  }
}

