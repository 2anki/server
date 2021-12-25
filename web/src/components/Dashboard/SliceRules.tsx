import { useEffect, useState } from "react";
import Backend from "../../lib/Backend";
import TemplateSelect from "../TemplateSelect";

let flashCardOptions = ["toggle", "bulleted_list_item", "numbered_list_item"];
let tagOptions = ["heading", "strikethrough"];

let backend = new Backend();
const SliceRules = ({ id, setDone }) => {
  const [rules, setRules] = useState({
    flashcard_is: "toggle",
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
        setRules(response.data);
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
            <TemplateSelect
              pickedTemplate={(name: string) => setFlashcard(name)}
              values={flashCardOptions.map((fco) => {
                return { label: `Flashcards are ${fco}`, value: fco };
              })}
              name={"Toggles"}
              value={rules.flashcard_is}
            />
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
