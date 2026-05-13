import { SubmitReEngagementFeedbackUseCase } from './SubmitReEngagementFeedbackUseCase';
import { InMemoryReEngagementRepository } from '../data_layer/ReEngagementRepository';

describe('SubmitReEngagementFeedbackUseCase', () => {
  it('saves response when token is valid', async () => {
    const repo = new InMemoryReEngagementRepository();
    await repo.recordSend(1, 'valid-token-abc');
    const useCase = new SubmitReEngagementFeedbackUseCase(repo);

    await useCase.execute({
      token: 'valid-token-abc',
      stoppedReason: 'too_complex',
      contentType: 'notion',
      comment: 'Was not sure how to use it',
    });

    const responses = repo.getResponses();
    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchObject({
      stoppedReason: 'too_complex',
      contentType: 'notion',
      comment: 'Was not sure how to use it',
    });
  });

  it('saves response with null comment when comment is omitted', async () => {
    const repo = new InMemoryReEngagementRepository();
    await repo.recordSend(2, 'token-no-comment');
    const useCase = new SubmitReEngagementFeedbackUseCase(repo);

    await useCase.execute({
      token: 'token-no-comment',
      stoppedReason: 'forgot',
      contentType: 'upload',
    });

    const responses = repo.getResponses();
    expect(responses[0].comment).toBeNull();
  });

  it('throws when token is not found', async () => {
    const repo = new InMemoryReEngagementRepository();
    const useCase = new SubmitReEngagementFeedbackUseCase(repo);

    await expect(
      useCase.execute({
        token: 'nonexistent-token',
        stoppedReason: 'forgot',
        contentType: 'upload',
      })
    ).rejects.toThrow('Invalid or expired survey token.');
  });
});
