import UserUpload from '../../../lib/interfaces/UserUpload';
import { UploadContainer } from '../../Upload/styled';

interface Prop {
  uploads: UserUpload[] | undefined;
}

export function EmptyUploadsSection({ uploads }: Prop) {
  if (uploads && uploads.length > 0) {
    return null;
  }
  return (
    <UploadContainer>
      <p>
        You have no uploads! Make some from the{' '}
        <u>
          <a href="/search">search</a>
        </u>{' '}
        page.
      </p>
    </UploadContainer>
  );
}
