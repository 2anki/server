import { useEffect, useState } from "react";
import Backend from "../../lib/Backend";
import TemplateSelect from "../TemplateSelect";
import Switch from "../input/Switch";

let flashCardOptions = ["toggle", "bulleted_list_item", "numbered_list_item"];
let tagOptions = ["heading", "strikethrough"];

let backend = new Backend();
const SliceRules = ({ id, setDone }) => {
  const [rules, setRules] = useState({
    flashcard_is: ["toggle"],
    sub_deck_is: "child_page",
    tags_is: "strikethrough",
    deck_is: "page",
  });

  const [isLoading, setIsloading] = useState(true);
  const [flashcard, setFlashcard] = useState(rules.flashcard_is);
  const [tags, setTags] = useState(rules.tags_is);

  useEffect(() => {
    backend
      /* @ts-ignore */
      .getRules(id)
      .then((response) => {
        if (response.data) {
          setRules(response.data);
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
      await backend.saveRules(id, flashcard, "page", "child_page", tags);
      setDone();
    } catch (error) {
      console.error(error);
    }
    setIsloading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "480px", marginLeft: "auto" }}>
      <header className="card-header">
        <p className="card-header-title">Slice your flashcards</p>
        {isLoading && (
          <button className="m-2 card-header-icon button is-loading"></button>
        )}
        <div className="card-header-icon" onClick={() => setDone()}>
          <button className="delete"></button>
        </div>
      </header>

      {!isLoading && (
        <>
          <div className="card-content">
            {rules &&
              flashCardOptions.map((fco) => (
                <Switch
                  key={id}
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
                    setFlashcard(rules.flashcard_is);
                  }}
                />
              ))}
            <TemplateSelect
              pickedTemplate={(name: string) => setTags(name)}
              values={tagOptions.map((fco) => {
                return { label: `Tags are ${fco}`, value: fco };
              })}
              name={"Tags"}
              value={rules.tags_is}
            />
            <hr />
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

export default SliceRules;
