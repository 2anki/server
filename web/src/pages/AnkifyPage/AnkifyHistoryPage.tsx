import sharedStyles from '../../styles/shared.module.css';
import { Backend } from '../../lib/backend/Backend';
import WorkspaceBar from './components/WorkspaceBar';
import ReviewDataExport from './components/ReviewDataExport';

interface Props {
  readonly backend?: Backend;
}

export default function AnkifyHistoryPage({ backend }: Props) {
  return (
    <main className={sharedStyles.page}>
      <WorkspaceBar backend={backend} showWorkspaceLink />
      <h1 className={sharedStyles.title}>Study history</h1>
      <ReviewDataExport backend={backend} />
    </main>
  );
}
