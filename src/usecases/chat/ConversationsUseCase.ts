import type { IConversationsRepository, ConversationSummary, ConversationWithMessages } from '../../data_layer/ConversationsRepository';

const MAX_TITLE_LENGTH = 120;

export class InvalidTitleError extends Error {
  constructor() {
    super('Invalid title');
    this.name = 'InvalidTitleError';
  }
}

export class ConversationsUseCase {
  constructor(private readonly repo: IConversationsRepository) {}

  list(userId: number): Promise<ConversationSummary[]> {
    return this.repo.listForUser(userId);
  }

  get(input: { userId: number; conversationId: number }): Promise<ConversationWithMessages | null> {
    return this.repo.findForUser(input);
  }

  async rename(input: {
    userId: number;
    conversationId: number;
    title: string;
  }): Promise<boolean> {
    const trimmed = input.title.trim();
    if (trimmed.length === 0 || trimmed.length > MAX_TITLE_LENGTH) {
      throw new InvalidTitleError();
    }
    return this.repo.rename({
      userId: input.userId,
      conversationId: input.conversationId,
      title: trimmed,
    });
  }

  delete(input: { userId: number; conversationId: number }): Promise<boolean> {
    return this.repo.softDelete(input);
  }
}
