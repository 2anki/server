import {
  Dispatch, SetStateAction, useContext, useState,
} from 'react';

import Backend from '../../../../lib/Backend';
import DefineRules from '../DefineRules';

import ObjectActions from '../actions/ObjectActions';
import ObjectAction from '../actions/ObjectAction';
import { Entry, ObjectMeta } from './styled';
import ObjectType from '../ObjectType';
import DotsHorizontal from '../../../../components/icons/DotsHorizontal';
import StoreContext from '../../../../store/StoreContext';
import NotionObject from '../../../../lib/interfaces/NotionObject';

const backend = new Backend();

interface Props {
  isFavorite: boolean;
  title: string;
  icon: string;
  url: string;
  id: string;
  type: string;
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
}

function SearchObjectEntry(props: Props) {
  const {
    title, icon, url, id, type, isFavorite, setFavorites,
  } = props;
  const [showSettings, setShowSettings] = useState(false);
  const store = useContext(StoreContext);

  return (
    <>
      <Entry>
        <ObjectMeta>
          <ObjectType type={type} />
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
                  store.error = error;
                });
            }}
          />
          <ObjectAction url={url} image="/icons/Notion_app_logo.png" />
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
            <DotsHorizontal width={32} height={32} />
          </div>
        </ObjectActions>
      </Entry>
      {showSettings && (
        <DefineRules
          type={type}
          isFavorite={isFavorite}
          setFavorites={setFavorites}
          parent={title}
          id={id}
          setDone={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

export default SearchObjectEntry;
