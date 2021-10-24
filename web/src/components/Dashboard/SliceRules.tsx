import TemplateSelect from "../TemplateSelect";

let flashCardOptions = ["Toggles", "Bulletpoints", "Numbered lists"];
let deckOptions = ["Pages", "Databases", "Headings"];
let tagOptions = ["Headings", "Strikethroughs"];

const SliceRules = ({ setDone }) => {
  return (
    <div className="card" style={{ maxWidth: "480px", marginLeft: "auto" }}>
      <header className="card-header">
        <p className="card-header-title">Slice rules - you can define rules!</p>
      </header>
      <div className="card-content">
        <TemplateSelect
          pickedTemplate={(name: string) => console.log(name)}
          values={flashCardOptions.map((fco) => {
            return { label: `Flashcards are ${fco}`, value: fco };
          })}
          name={"Toggles"}
          value={"Flashcards are Toggles"}
        />
        <TemplateSelect
          pickedTemplate={(name: string) => console.log(name)}
          values={tagOptions.map((fco) => {
            return { label: `Tags are ${fco}`, value: fco };
          })}
          name={"Tags"}
          value={"Tags"}
        />
        <hr />
        <TemplateSelect
          pickedTemplate={(name: string) => console.log(name)}
          values={deckOptions.map((fco) => {
            return { label: `Sub-decks are ${fco}`, value: fco };
          })}
          name={"Pages"}
          value={"Pages"}
        />
        <TemplateSelect
          pickedTemplate={(name: string) => console.log(name)}
          values={deckOptions.map((fco) => {
            return { label: `Decks are ${fco}`, value: fco };
          })}
          name={"Pages"}
          value={"Pages"}
        />
      </div>
      <footer className="card-footer">
        <a href="#" className="card-footer-item">
          Save
        </a>
        <a href="#" className="card-footer-item" onClick={() => setDone()}>
          Cancel
        </a>
      </footer>
    </div>
  );
};

export default SliceRules;
