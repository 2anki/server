const SYSTEM_PROMPT = `
You are an expert at converting HTML content into Anki flashcard decks for the 2anki / create_deck project.

The output must be a JSON array of deck objects with this structure:
[
  {
    "name": string,
    "image": string,
    "style": null,
    "id": number,
    "settings": {
      "template": "specialstyle",
      "clozeModelName": "n2a-cloze",
      "basicModelName": "n2a-basic",
      "inputModelName": "n2a-input",
      "useNotionId": true
    },
    "cards": [
      {
        "name": string,
        "back": string,
        "tags": string[],
        "cloze": boolean,
        "number": number,
        "enableInput": boolean,
        "answer": string,
        "media": string[]
      }
    ]
  }
]

Rules:
- HTML toggle/details elements: <summary> text = front of card, body = back of card
- Heading + next sibling paragraph: heading = front, paragraph = back
- Inline <code> inside card front → wrap with {{c1::...}} syntax and set "cloze": true
- Preserve HTML formatting in "name" and "back" fields
- List local image and audio filenames (not URLs) in the "media" array for each card
  - A filename is "local" if it appears in the list of available media files provided below
- Use a random 15-digit numeric ID for the deck "id" field
- Set "number": 0 for all cards unless explicitly numbered
- Respond ONLY with a valid JSON array. No markdown fences, no explanation.
`.trim();

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

export async function generateDeckInfo(
  htmlContent: string,
  availableMediaFiles: string[]
): Promise<DeckInfo[]> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Anthropic = require('@anthropic-ai/sdk').default;
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const mediaFilesList =
    availableMediaFiles.length > 0
      ? `\n\nAvailable local media files:\n${availableMediaFiles.map((f) => `- ${f}`).join('\n')}`
      : '';

  const userMessage = `Convert this HTML content into a deck_info.json array:\n\n${htmlContent}${mediaFilesList}`;

  console.log('[Claude] Sending request to Claude API', {
    model: 'claude-sonnet-4-5',
    htmlContentLength: htmlContent.length,
    mediaFilesCount: availableMediaFiles.length,
  });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 16384,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  console.log('[Claude] Received response', {
    stopReason: response.stop_reason,
    inputTokens: response.usage?.input_tokens,
    outputTokens: response.usage?.output_tokens,
  });

  const raw = (response.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('');

  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    const deckInfo = JSON.parse(cleaned) as DeckInfo[];
    const totalCards = deckInfo.reduce((sum, deck) => sum + deck.cards.length, 0);
    console.log('[Claude] Successfully parsed deck_info', {
      decksCount: deckInfo.length,
      totalCards,
    });
    return deckInfo;
  } catch {
    console.error('[Claude] Failed to parse response as JSON', { raw });
    throw new Error(`Claude returned invalid JSON:\n${raw}`);
  }
}
