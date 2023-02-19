import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import useQuery from '../../lib/hooks/useQuery';
import StoreContext from '../../store/StoreContext';
import WarningMessage from '../../components/WarningMessage';
import UploadForm from './components/UploadForm';
import SettingsIcon from '../../components/icons/SettingsIcon';
import SettingsModal from '../../components/modals/SettingsModal';
import {
  FlexColumn,
  ImportTitle,
  InfoMessage,
  SettingsLink,
  UploadContainer
} from './styled';
import { Main, PageContainer } from '../../components/styled';
import { ErrorHandlerType } from '../../components/errors/helpers/types';

interface Props {
  setErrorMessage: ErrorHandlerType;
}

function UploadPage({ setErrorMessage }: Props) {
  const isDevelopment = !window.location.host.match(/2anki.(com|net|de)/);
  const query = useQuery();
  const view = query.get('view');

  const [isSettings, setShowSettings] = useState(
    view === 'template' || view === 'deck-options' || view === 'card-options'
  );

  const store = useContext(StoreContext);

  // Make sure the defaults are set if not present to ensure backwards compatability
  useEffect(() => {
    store.syncLocalStorage();
  }, [store]);

  return (
    <PageContainer>
      <UploadContainer>
        <Main>
          {isDevelopment ? <WarningMessage /> : null}
          <FlexColumn>
            <ImportTitle>Import</ImportTitle>
            <SettingsLink onClick={() => setShowSettings(true)}>
              <Link className="link" to="upload?view=template">
                <SettingsIcon />
                Settings
              </Link>
            </SettingsLink>
          </FlexColumn>
          <div className="container">
            <UploadForm setErrorMessage={setErrorMessage} />
            <InfoMessage>
              2anki.net currently only supports
              <a
                rel="noreferrer"
                target="_blank"
                href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7"
              >
                {' '}
                HTML and ZIP exports from Notion
              </a>
              . All files are automatically deleted after 21 minutes. Checkout
              the{' '}
              <a
                rel="noreferrer"
                target="_blank"
                href="https://youtube.com/c/alexanderalemayhu?sub_confirmation=1"
              >
                YouTube channel for tutorials
              </a>
              . Notion API support is in the works and coming soon!
            </InfoMessage>
            <SettingsModal
              setError={setErrorMessage}
              pageId={null}
              isActive={isSettings}
              onClickClose={() => {
                window.history.pushState({}, '', 'upload');
                setShowSettings(false);
              }}
            />
          </div>
        </Main>
      </UploadContainer>
    </PageContainer>
  );
}

export default UploadPage;
