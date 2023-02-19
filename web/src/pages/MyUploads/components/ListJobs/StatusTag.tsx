export type JobStatus =
  | 'started'
  | 'step1_create_workspace'
  | 'step2_creating_flashcards'
  | 'step3_building_deck'
  | 'stale'
  | 'failed'
  | 'cancelled';

interface Prop {
  status: JobStatus;
}

function getIndicator(status: JobStatus) {
  switch (status) {
    case'started':
      return 'is-info';
    case'step1_create_workspace':
      return 'is-info';
    case'step2_creating_flashcards':
      return 'is-info';
    case'step3_building_deck':
      return 'is-info';
    default:
      return 'is-warning';
  }
}

export function StatusTag({ status }: Prop) {

  const indicator = getIndicator(status);

  return <span className={`is-small mx-2 tag ${indicator}`}>
    {status}
            </span>;
}