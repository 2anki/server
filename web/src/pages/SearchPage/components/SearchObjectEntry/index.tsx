import { Dispatch, SetStateAction, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import ObjectAction from '../actions/ObjectAction';
import DotsHorizontal from '../../../../components/icons/DotsHorizontal';
import EyeIcon from '../../../../components/icons/EyeIcon';
import NotionObject from '../../../../lib/interfaces/NotionObject';
import { OK } from '../../../../lib/backend/http';
import { BlockIcon } from '../BlockIcon';
import { ErrorHandlerType } from '../../../../components/errors/helpers/getErrorMessage';
import { get2ankiApi } from '../../../../lib/backend/get2ankiApi';
import styles from './SearchObjectEntry.module.css';

interface Props {
  isFavorite: boolean | undefined;
  title: string;
  icon: string | undefined;
  url: string;
  id: string;
  type: string;
  setFavorites: Dispatch<SetStateAction<NotionObject[]>>;
  setError: ErrorHandlerType;
}

/**
 * Unfortunately due to the implementation of favorites, there is some type mismatch.
 * When that is cleaned up this can be deleted.
 */
const getType = (data: string | { object: string }): string | null => {
  if (typeof data === 'object' && 'object' in data) {
    return data.object;
  }
  return typeof data === 'string' ? data : null;
};

function SearchObjectEntry(props: Readonly<Props>) {
  const { title, icon, url, id, type, setError } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [converting, setConverting] = useState(false);

  const openRules = () => {
    const params = new URLSearchParams();
    params.set('title', title);
    const resolvedType = getType(type);
    if (resolvedType) params.set('type', resolvedType);
    params.set('returnTo', `${location.pathname}${location.search}`);
    navigate(`/rules/${encodeURIComponent(id)}?${params.toString()}`);
  };

  const handleConvert = (event: React.MouseEvent) => {
    event.preventDefault();
    if (converting) return;
    setConverting(true);
    get2ankiApi()
      .convert(id, getType(type), title)
      .then((response) => {
        if (response.status === OK) {
          window.location.href = '/downloads';
        } else {
          setConverting(false);
          response.text().then(setError);
        }
      })
      .catch((error) => {
        setConverting(false);
        setError(error);
      });
  };

  return (
    <div className={styles.entry} data-hj-suppress>
      <div className={styles.objectMeta}>
        <BlockIcon icon={icon} />
        <span>{title}</span>
      </div>
      <div className={styles.objectActions}>
        {converting && (
          <output className={styles.convertingBadge}>
            Starting conversion…
          </output>
        )}
        <ObjectAction
          url={url}
          image="/icons/Anki_app_logo.png"
          label={converting ? `Converting ${title}…` : `Convert ${title} to Anki`}
          onClick={handleConvert}
          disabled={converting}
        />
        <ObjectAction
          url={url}
          image="/icons/Notion_app_logo.png"
          label={`Open ${title} in Notion`}
        />
        {getType(type) !== 'database' && (
          <Link
            to={`/preview/${encodeURIComponent(id)}`}
            className={styles.rulesButton}
            aria-label={`Preview ${title}`}
            title={`Preview ${title}`}
          >
            <EyeIcon width={32} height={32} />
          </Link>
        )}
        <button
          type="button"
          className={styles.rulesButton}
          onClick={openRules}
          aria-label={`Configure rules for ${title}`}
          title={`Configure rules for ${title}`}
        >
          <DotsHorizontal width={32} height={32} />
        </button>
      </div>
    </div>
  );
}

export default SearchObjectEntry;
