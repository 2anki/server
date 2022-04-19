import { useEffect, useState } from 'react';

import Switch from '../../../components/input/Switch';
import SettingsModal from '../../../components/modals/SettingsModal';
import TemplateSelect from '../../../components/TemplateSelect';
import Backend from '../../../lib/Backend';

interface Props {
  id: string;
  setDone: () => void;
  parent: string;
  setError: (error: string) => void;
}

const flashCardOptions = [
  'toggle',
  'bulleted_list_item',
  'numbered_list_item',
  'heading',
  'column_list',
];
const tagOptions = ['heading', 'strikethrough'];

const backend = new Backend();
function DefineRules({
  id, setDone, parent, setError,
}: Props) {
  const [rules, setRules] = useState({
    flashcard_is: ['toggle'],
    sub_deck_is: 'child_page',
    tags_is: 'strikethrough',
    deck_is: 'page',
    email_notification: false,
  });

  const [isLoading, setIsloading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [flashcard, setFlashcard] = useState(rules.flashcard_is);
  const [tags, setTags] = useState(rules.tags_is);
  const [sendEmail, setSendEmail] = useState(rules.email_notification);
  const [more, setMore] = useState(false);

  useEffect(() => {
    backend
      .getRules(id)
      .then((response) => {
        if (response.data) {
          const newRules = response.data;
          newRules.flashcard_is = newRules.flashcard_is.split(',');
          setRules(newRules);
          setSendEmail(newRules.email_notification);
        }
        setIsloading(false);
      })
      .catch((error) => {
        setError(error.response.data.message);
      });
  }, [id]);

  const saveRules = async (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);

    try {
      await backend.saveRules(
        id,
        rules.flashcard_is,
        'page',
        'child_page',
        tags,
      );
      setDone();
    } catch (error) {
      setError(error.response.data.message);
    }
    setIsloading(false);
  };

  const onSelectedFlashcardTypes = (fco: string) => {
    const included = rules.flashcard_is.includes(fco);
    if (!included) {
      rules.flashcard_is.push(fco);
    } else if (included) {
      rules.flashcard_is = rules.flashcard_is.filter(
        (f) => f !== fco,
      );
    }
    setFlashcard((prevState) => Array.from(new Set([...prevState, ...rules.flashcard_is])));
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" />
      <div className="modal-card">
        <div className="card" style={{ maxWidth: '480px' }}>
          <header className="card-header">
            <p className="card-header-title">
              Settings for
              {' '}
              {parent}
            </p>
            {isLoading && (
              <button
                aria-label="loading"
                type="button"
                className="m-2 card-header-icon button is-loading"
              />
            )}
            <div className="card-header-icon">
              <button
                onClick={() => setDone()}
                aria-label="delete"
                type="button"
                className="delete"
              />
            </div>
          </header>
          {!isLoading && (
            <>
              {more && (
                <SettingsModal
                  pageId={id}
                  pageTitle={parent}
                  isActive={more}
                  onClickClose={() => {
                    setMore(false);
                  }}
                  setError={setError}
                />
              )}
              <div className="card-content">
                <h2 className="subtitle">What is a flashcard?</h2>
                {flashCardOptions.map((fco) => (
                  <Switch
                    key={fco}
                    id={fco}
                    title={`Flashcards are ${fco}`}
                    checked={rules.flashcard_is.includes(fco)}
                    onSwitched={() => onSelectedFlashcardTypes(fco)}
                  />
                ))}
                <div className="my-4">
                  <h2 className="subtitle">Card fields</h2>
                  <TemplateSelect
                    pickedTemplate={(name: string) => setTags(name)}
                    values={tagOptions.map((fco) => ({
                      label: `Tags are ${fco}`,
                      value: fco,
                    }))}
                    name="Tags"
                    value={rules.tags_is}
                  />
                </div>
                <h2 className="subtitle">Miscallenous</h2>
                <Switch
                  key="email-notification"
                  id="email-notification"
                  title="Receive email notifications when deck(s) are ready"
                  checked={sendEmail}
                  onSwitched={() => {
                    rules.email_notification = !rules.email_notification;
                    setSendEmail(rules.email_notification);
                  }}
                />
                <div className="has-text-centered">
                  <hr />
                  <button
                    type="button"
                    className="button is-small"
                    onClick={() => setMore(!more)}
                  >
                    More!
                  </button>
                </div>
              </div>
              <footer className="card-footer">
                <a
                  href="/save-rules"
                  className="card-footer-item"
                  onClick={saveRules}
                >
                  Save
                </a>
                <a
                  href="/cancel-rules"
                  className="card-footer-item"
                  onClick={(event) => {
                    event.preventDefault();
                    setDone();
                  }}
                >
                  Cancel
                </a>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DefineRules;
