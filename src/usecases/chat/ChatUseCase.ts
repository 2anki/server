import type Anthropic from '@anthropic-ai/sdk';
import type { IChatMessagesRepository } from '../../data_layer/ChatMessagesRepository';

const FREE_MONTHLY_LIMIT = 20;
const FREE_MODEL = 'claude-haiku-4-5-20251001';
const PATREON_MODEL = 'claude-sonnet-4-6';
const MAX_HISTORY_TURNS = 10;
const MAX_TOKENS = 4096;

const STUDY_ASSISTANT_SYSTEM_PROMPT = `You are a study assistant for 2anki, a tool that turns notes into Anki flashcards.

Help users understand material, answer study questions, and create flashcards. When generating flashcards, you MUST wrap them in a JSON code block using EXACTLY this format — no exceptions:

\`\`\`json
[{"front": "question or term", "back": "answer or definition"}]
\`\`\`

Never output raw JSON without the code fence. Always include the opening \`\`\`json and closing \`\`\` markers.

After giving any explanation or answer, offer to turn the content into flashcards if the user hasn't already asked. Keep responses focused and practical — this is a study tool, not a general assistant.`;

export interface ChatCard {
  front: string;
  back: string;
}

export interface ChatUser {
  owner: number;
  patreon: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SendMessageResult {
  content: string;
  contentBefore?: string;
  contentAfter?: string;
  cards?: ChatCard[];
}

export class ChatRateLimitError extends Error {
  readonly resetDate: string;

  constructor(resetDate: string) {
    super('Message limit reached');
    this.name = 'ChatRateLimitError';
    this.resetDate = resetDate;
  }
}

function firstOfNextMonth(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toISOString();
}

interface ExtractCardsResult {
  cards: ChatCard[] | undefined;
  contentBefore: string | undefined;
  contentAfter: string | undefined;
}

function parseCardArray(raw: string): ChatCard[] | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    return undefined;
  }
  if (!Array.isArray(parsed)) return undefined;
  const cards: ChatCard[] = [];
  for (const item of parsed) {
    if (
      item != null &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).front === 'string' &&
      typeof (item as Record<string, unknown>).back === 'string'
    ) {
      cards.push({
        front: (item as { front: string }).front,
        back: (item as { back: string }).back,
      });
    }
  }
  return cards.length > 0 ? cards : undefined;
}

function extractCards(text: string): ExtractCardsResult {
  const fencedMatch = /```json\s*([\s\S]*?)```/.exec(text);
  if (fencedMatch != null) {
    const cards = parseCardArray(fencedMatch[1]);
    if (cards != null) {
      const before = text.slice(0, fencedMatch.index).trim();
      const after = text.slice(fencedMatch.index + fencedMatch[0].length).trim();
      return {
        cards,
        contentBefore: before.length > 0 ? before : undefined,
        contentAfter: after.length > 0 ? after : undefined,
      };
    }
  }

  // Fallback: detect a raw JSON array that starts with [{"front": ...}]
  const rawMatch = /((?:^|\n)\s*)(\[\s*\{[\s\S]*\}\s*\])/.exec(text);
  if (rawMatch != null) {
    const cards = parseCardArray(rawMatch[2]);
    if (cards != null) {
      const before = text.slice(0, rawMatch.index).trim();
      const after = text.slice(rawMatch.index + rawMatch[0].length).trim();
      return {
        cards,
        contentBefore: before.length > 0 ? before : undefined,
        contentAfter: after.length > 0 ? after : undefined,
      };
    }
  }

  return { cards: undefined, contentBefore: undefined, contentAfter: undefined };
}

export class ChatUseCase {
  constructor(
    private readonly repo: IChatMessagesRepository,
    private readonly anthropic: Anthropic
  ) {}

  async execute(input: {
    user: ChatUser;
    content: string;
    conversationHistory: ChatMessage[];
    onToken?: (text: string) => void;
  }): Promise<SendMessageResult> {
    const { user, content, conversationHistory, onToken } = input;

    if (!user.patreon) {
      const count = await this.repo.countThisMonth(user.owner);
      if (count >= FREE_MONTHLY_LIMIT) {
        throw new ChatRateLimitError(firstOfNextMonth());
      }
    }

    const model = user.patreon ? PATREON_MODEL : FREE_MODEL;

    const recentHistory = conversationHistory.slice(-MAX_HISTORY_TURNS);
    const messages: Anthropic.MessageParam[] = [
      ...recentHistory.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content },
    ];

    await this.repo.insert({ userId: user.owner, role: 'user', content });

    const stream = this.anthropic.messages.stream({
      model,
      max_tokens: MAX_TOKENS,
      system: STUDY_ASSISTANT_SYSTEM_PROMPT,
      messages,
    });

    if (onToken != null) {
      stream.on('text', onToken);
    }

    const finalMessage = await stream.finalMessage();

    const assistantContent = finalMessage.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    await this.repo.insert({ userId: user.owner, role: 'assistant', content: assistantContent });

    const { cards, contentBefore, contentAfter } = extractCards(assistantContent);

    return {
      content: assistantContent,
      ...(cards != null ? { cards } : {}),
      ...(contentBefore != null ? { contentBefore } : {}),
      ...(contentAfter != null ? { contentAfter } : {}),
    };
  }
}
