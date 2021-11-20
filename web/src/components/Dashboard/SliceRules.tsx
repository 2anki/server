import { useEffect, useState } from "react";
import Backend from "../../lib/Backend";
import TemplateSelect from "../TemplateSelect";

let flashCardOptions = ["Toggles", "Bulletpoints", "Numbered lists"];
let deckOptions = ["Pages", "Databases", "Headings"];
let tagOptions = ["Headings", "Strikethroughs"];

let backend = new Backend();
const SliceRules = ({ id, setDone }) => {
  const [rules, setRules] = useState({
    flashcard_is: "Toggle",
    sub_deck_is: "Pages",
    tags_is: "Headings",
    deck_is: "Pages",
  });

  const [isLoading, setIsloading] = useState(true);
  const [flashcard, setFlashcard] = useState(rules.flashcard_is);
  const [deck, setDeck] = useState(rules.deck_is);
  const [subDecks, setSubDeck] = useState(rules.sub_deck_is);
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
  }, []);

  const saveRules = async (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    setIsloading(true);

    try {
      await backend.saveRules(id, flashcard, deck, subDecks, tags);
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
            <TemplateSelect
              pickedTemplate={(name: string) => setSubDeck(name)}
              values={deckOptions.map((fco) => {
                return { label: `Sub-decks are ${fco}`, value: fco };
              })}
              name={"Pages"}
              value={rules.sub_deck_is}
            />
            <TemplateSelect
              pickedTemplate={(name: string) => setDeck(name)}
              values={deckOptions.map((fco) => {
                return { label: `Decks are ${fco}`, value: fco };
              })}
              name={"Pages"}
              value={rules.deck_is}
            />
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
