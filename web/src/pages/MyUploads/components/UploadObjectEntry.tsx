import ReactHtmlParser from 'react-html-parser';
import styled from 'styled-components';

import ObjectAction from '../../Search/components/actions/ObjectAction';

const Entry = styled.div`
  display: flex;
  align-items: center;
  grid-gap: 1.2rem;
  padding: 1rem;
  font-size: 2.4vw;
  justify-content: space-between;
`;

const ObjectMeta = styled.div`
  align-items: center;
  display: flex;
  grid-gap: 1.2rem;
`;

const ObjectActions = styled.div`
  display: flex;
  grid-gap: 1rem;
  min-width: 80px;
  justify-content: center;
`;

const UploadTitle = styled.span`
  display: flex;
  align-items: center;
`;

interface Props {
  size: string;
  title: string;
  icon: string;
  url: string;
  deleteUpload: () => void;
}

export default function UploadObjectEntry({
  size, title, icon, url, deleteUpload,
}: Props) {
  return (
    <Entry>
      <ObjectMeta>
        <button type="button" className="delete" onClick={() => deleteUpload()}>
          Delete
        </button>
        <div className="control">
          <div className="tags has-addons">
            <span className="tag is-info">Size</span>
            <span className="tag">
              {size}
              {' '}
              MB
            </span>
          </div>
        </div>
        <span>{icon}</span>
        <UploadTitle className="subtitle is-6">
          {ReactHtmlParser(title)}
        </UploadTitle>
      </ObjectMeta>
      <ObjectActions>
        <ObjectAction
          url={url}
          image="/icons/Anki_app_logo.png"
        />
      </ObjectActions>
    </Entry>
  );
}
