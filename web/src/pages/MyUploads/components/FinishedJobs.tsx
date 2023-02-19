import UploadObjectEntry from './UploadObjectEntry';
import UserUpload from '../../../lib/interfaces/UserUpload';

interface Prop {
  uploads: UserUpload[] | undefined;
  deleteUpload: (key: string) => void;
}

export function FinishedJobs({ uploads, deleteUpload }: Prop) {
  if (!uploads || uploads.length === 0) {
    return null;
  }

  return (
    <>
      {uploads.map((u) => (
        <UploadObjectEntry
          data-hj-suppress
          key={u.key}
          title={u.filename}
          icon={null}
          url={`/api/download/u/${u.key}`}
          deleteUpload={() => deleteUpload(u.key)}
        />
      ))}
    </>
  );
}
