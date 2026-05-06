import { jobStepFromStatus } from './jobStepFromStatus';

describe('jobStepFromStatus', () => {
  test('maps started to step 1', () => {
    expect(jobStepFromStatus('started')).toEqual({ step: 1 });
  });

  test('maps Notion workspace step to step 2', () => {
    expect(jobStepFromStatus('step1_create_workspace')).toEqual({ step: 2 });
  });

  test('maps Notion flashcard extraction to step 3', () => {
    expect(jobStepFromStatus('step2_creating_flashcards')).toEqual({ step: 3 });
  });

  test('maps deck building to step 4', () => {
    expect(jobStepFromStatus('step3_building_deck')).toEqual({ step: 4 });
  });

  test('maps Claude chunk progress to step 3 with substep', () => {
    expect(jobStepFromStatus('claude:chunk:2:5')).toEqual({
      step: 3,
      substep: '2 / 5',
    });
  });

  test('falls back to step 1 for unknown statuses', () => {
    expect(jobStepFromStatus('mystery-string')).toEqual({ step: 1 });
  });
});
