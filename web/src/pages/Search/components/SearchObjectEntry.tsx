import { useState } from 'react';

import styled from 'styled-components';
import Backend from '../../../lib/Backend';
import DefineRules from '../DefineRules';

import ObjectActions from '../actions/ObjectActions';
import ObjectAction from '../actions/ObjectAction';

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

const backend = new Backend();

interface Props {
  title: string;
  icon: string;
  url: string;
  id: string;
  type: string;
  setError: (error: string) => void;
}

function SearchObjectEntry({
  title, icon, url, id, type, setError,
}: Props) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>

      <Entry>
        <ObjectMeta>
          <div className="control">
            <div className="tags has-addons">
              <span className="tag">Type</span>
              <span className="tag is-link">{type}</span>
            </div>
          </div>
          {icon && (icon.includes('http') || icon.includes('data:image')) ? (
            <img width={32} height={32} src={icon} alt="icon" />
          ) : (
            <span>{icon}</span>
          )}
          <span className="subtitle is-6">{title}</span>
        </ObjectMeta>
        <ObjectActions>
          <ObjectAction
            url={url}
            image="/icons/Anki_app_logo.png"
            onClick={(event) => {
              event.preventDefault();
              backend
                .convert(id, type)
                .then(() => {
                  window.location.href = '/uploads';
                })
                .catch((error) => {
                  setError(error.response.data.message);
                });
            }}
          />
          <ObjectAction
            url={url}
            image="/icons/Notion_app_logo.png"
          />
          <div
            role="button"
            tabIndex={-1}
            onClick={() => setShowSettings(!showSettings)}
            onKeyDown={(event) => {
              if (event.key === 'F1') {
                setShowSettings(!showSettings);
              }
            }}
          >
            <img src="/icons/settings.svg" width="32px" alt="settings" />
          </div>
        </ObjectActions>
      </Entry>
      {showSettings && (
        <DefineRules
          parent={title}
          id={id}
          setDone={() => setShowSettings(false)}
          setError={setError}
        />
      )}
    </>
  );
}

export default SearchObjectEntry;
