import { useState } from "react";

import styled from "styled-components";

const StyledInput = styled.input`
  font-weight: bold;
  color: #83c9f5;
`;

const DeckOptions = () => {
  const key = "empty-description";
  const deckNameKey = "deckName";
  const [isEmpty, setIsEmpty] = useState(localStorage.getItem(key) === "true");
  const [deckName, setDeckName] = useState(
    localStorage.getItem(deckNameKey) || ""
  );

  return (
    <div className="container">
      <div className="has-text-centered">
        <h2 className="title">Deck Options</h2>
      </div>
      <div className="box">
        <div className="field">
          <strong>Deck Description</strong>
          <div className="field">
            <input
              type="checkbox"
              checked={isEmpty}
              onChange={() => {
                const empty = !isEmpty;
                localStorage.setItem(key, empty.toString());
                setIsEmpty(empty);
              }}
            />
            Empty description
          </div>
        </div>
        <div className="field">
          <strong>Deck Name</strong>
          <div className="control">
            <StyledInput
              placeholder="Enter deck name (optional)"
              value={deckName}
              onChange={(event) => {
                const newName = event.target.value;
                if (newName !== deckName) {
                  setDeckName(newName);
                  localStorage.setItem(deckNameKey, deckName);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckOptions;
