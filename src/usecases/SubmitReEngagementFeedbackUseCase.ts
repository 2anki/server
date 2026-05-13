import type { IReEngagementRepository } from '../data_layer/ReEngagementRepository';

export interface ReEngagementFeedbackInput {
  token: string;
  stoppedReason: string;
  contentType: string;
  comment?: string | null;
}

export class SubmitReEngagementFeedbackUseCase {
  constructor(private readonly repo: IReEngagementRepository) {}

  async execute(input: ReEngagementFeedbackInput): Promise<void> {
    const record = await this.repo.findByToken(input.token);
    if (record == null) {
      throw new Error('Invalid or expired survey token.');
    }
    await this.repo.saveResponse(
      record.id,
      input.stoppedReason,
      input.contentType,
      input.comment ?? null
    );
  }
}
