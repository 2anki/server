import { useEffect, useState } from "react";
import Backend from "../../lib/Backend";
import TemplateSelect from "../TemplateSelect";
import Switch from "../input/Switch";
import SettingsModal from "../modals/SettingsModal";

let flashCardOptions = ["toggle", "bulleted_list_item", "numbered_list_item"];
let tagOptions = ["heading", "strikethrough"];

let backend = new Backend();
const DefineRules = ({ id, setDone, parent }) => {
  const [rules, setRules] = useState({
    flashcard_is: ["toggle"],
    sub_deck_is: "child_page",
    tags_is: "strikethrough",
    deck_is: "page",
    email_notification: false,
  });

  const [isLoading, setIsloading] = useState(true);
  // TODO: fix this hack
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_flashcard, setFlashcard] = useState(rules.flashcard_is);
  const [tags, setTags] = useState(rules.tags_is);
  const [sendEmail, setSendEmail] = useState(rules.email_notification);
  const [more, setMore] = useState(false);

  useEffect(() => {
    backend
      .getRules(id)
      .then((response) => {
        if (response.data) {
          const newRules = response.data;
          newRules.flashcard_is = newRules.flashcard_is.split(",");
          setRules(newRules);
          setSendEmail(newRules.email_notification);
        }
        setIsloading(false);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, [id]);

  const saveRules = async (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);

    try {
      await backend.saveRules(id, rules.flashcard_is, "page", "child_page", tags);
      setDone();
    } catch (error) {
      console.error(error);
    }
    setIsloading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "480px", marginLeft: "auto" }}>
      <header className="card-header">
        <p className="card-header-title">Settings for {parent}</p>
        {isLoading && (
          <button className="m-2 card-header-icon button is-loading"></button>
        )}
        <div className="card-header-icon" onClick={() => setDone()}>
          <button className="delete"></button>
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
                onSwitched={() => {
                  const included = rules.flashcard_is.includes(fco);
                  if (!included) {
                    rules.flashcard_is.push(fco);
                  } else if (included) {
                    rules.flashcard_is = rules.flashcard_is.filter(
                      (f) => f !== fco
                    );
                  }
                  console.log("rules", rules);
                  setFlashcard((prevState) =>
                    Array.from(new Set([...prevState, ...rules.flashcard_is]))
                  );
                }}
              />
            ))}
            <div className="my-4">
              <h2 className="subtitle">Card fields</h2>
              <TemplateSelect
                pickedTemplate={(name: string) => setTags(name)}
                values={tagOptions.map((fco) => {
                  return { label: `Tags are ${fco}`, value: fco };
                })}
                name={"Tags"}
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
  );
};

export default DefineRules;
