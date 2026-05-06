export type StepIndex = 1 | 2 | 3 | 4;

export interface JobStepInfo {
  step: StepIndex;
  substep?: string;
}

const CLAUDE_CHUNK_PATTERN = /^claude:chunk:(\d+):(\d+)$/;

export function jobStepFromStatus(status: string): JobStepInfo {
  const chunkMatch = CLAUDE_CHUNK_PATTERN.exec(status);
  if (chunkMatch) {
    return { step: 3, substep: `${chunkMatch[1]} / ${chunkMatch[2]}` };
  }
  switch (status) {
    case 'step1_create_workspace':
      return { step: 2 };
    case 'step2_creating_flashcards':
      return { step: 3 };
    case 'step3_building_deck':
      return { step: 4 };
    case 'started':
    case 'stale':
    default:
      return { step: 1 };
  }
}
