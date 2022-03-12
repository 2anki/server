import { useState } from 'react';

import styled from 'styled-components';
import Backend from '../../lib/Backend';
import DefineRules from './DefineRules';

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

function ObjectAction({ url, image, onClick }) {
  return (
    <a href={url} target="_blank" rel="noreferrer" onClick={onClick}>
      <img alt="Page action" width="32px" src={image} />
    </a>
  );
}

const ObjectActions = styled.div`
  display: flex;
  grid-gap: 1rem;
  min-width: 80px;
`;

const backend = new Backend();
function SearchObjectEntry({
  title, icon, url, id, type,
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      {errorMessage && (
        <div className="is-info notification is-light my-4">
          <button
            className="delete"
            onClick={() => setErrorMessage(null)}
          />
          <div dangerouslySetInnerHTML={{ __html: errorMessage }} />
        </div>
      )}
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
                .then((res) => {
                  window.location.href = '/uploads';
                })
                .catch((error) => {
                  setErrorMessage(error.response.data.message);
                });
            }}
          />
          <ObjectAction
            url={url}
            image="/icons/Notion_app_logo.png"
            onClick={() => {}}
          />
          <div onClick={() => setShowSettings(!showSettings)}>
            <img src="/icons/settings.svg" width="32px" alt="settings" />
          </div>
        </ObjectActions>
      </Entry>
      {showSettings && (
        <DefineRules
          parent={title}
          id={id}
          setDone={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

export default SearchObjectEntry;
