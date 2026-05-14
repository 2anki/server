import type Anthropic from '@anthropic-ai/sdk';
import type { IChatMessagesRepository } from '../../data_layer/ChatMessagesRepository';

const FREE_MONTHLY_LIMIT = 20;
const FREE_MODEL = 'claude-haiku-4-5-20251001';
const PATREON_MODEL = 'claude-sonnet-4-6';
const MAX_HISTORY_TURNS = 10;
const MAX_TOKENS = 1024;

const STUDY_ASSISTANT_SYSTEM_PROMPT = `You are a study assistant for 2anki, a tool that turns notes into Anki flashcards.

Help users understand material, answer study questions, and create flashcards. When generating flashcards, always output them as a JSON code block in this exact format:

\`\`\`json
[{"front": "question or term", "back": "answer or definition"}]
\`\`\`

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

function extractCards(text: string): ExtractCardsResult {
  const match = /```json\s*([\s\S]*?)```/.exec(text);
  if (match == null) return { cards: undefined, contentBefore: undefined, contentAfter: undefined };

  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + match[0].length).trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1].trim());
  } catch {
    return { cards: undefined, contentBefore: undefined, contentAfter: undefined };
  }

  if (!Array.isArray(parsed)) return { cards: undefined, contentBefore: undefined, contentAfter: undefined };

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

  if (cards.length === 0) return { cards: undefined, contentBefore: undefined, contentAfter: undefined };

  return {
    cards,
    contentBefore: before.length > 0 ? before : undefined,
    contentAfter: after.length > 0 ? after : undefined,
  };
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
  }): Promise<SendMessageResult> {
    const { user, content, conversationHistory } = input;

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

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: STUDY_ASSISTANT_SYSTEM_PROMPT,
      messages,
    });

    const assistantContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    await this.repo.insert({ userId: user.owner, role: 'user', content });
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
