import { Entry, ObjectActions, ObjectMeta, UploadTitle } from './styled';
import { DeleteButton } from './ListJobs/DeleteButton';
import { ObjectIconAction } from '../../Search/components/SearchObjectEntry/styled';

interface Props {
  title: string;
  icon: string | null;
  url: string;
  deleteUpload: () => void;
}

export default function UploadObjectEntry({
                                            title,
                                            icon,
                                            url,
                                            deleteUpload
                                          }: Props) {
  return (
    <Entry>
      <ObjectMeta>
        <DeleteButton onDelete={deleteUpload} />
        {icon && <span>{icon}</span>}
        <div />
        <UploadTitle
          data-hj-suppress
          className="subtitle ml-2 is-6"
          dangerouslySetInnerHTML={{ __html: title }}
        />
      </ObjectMeta>
      <ObjectActions>
        <a download={title} href={url} target="_blank" rel="noreferrer">
          <ObjectIconAction alt="Page action" width="32px" src="/icons/Anki_app_logo.png" />
        </a>
      </ObjectActions>
    </Entry>
  );
}
