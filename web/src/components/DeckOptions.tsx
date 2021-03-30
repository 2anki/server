import { useState } from "react";
import styled from "styled-components";

import LocalCheckbox from "./LocalCheckbox";

const StyledInput = styled.input`
  font-weight: bold;
  color: #83c9f5;
`;

const DeckOptions = () => {
  const deckNameKey = "deckName";
  const [deckName, setDeckName] = useState(
    localStorage.getItem(deckNameKey) || ""
  );

  return (
    <div className="container">
      <div className="has-text-centered">
        <h2 className="title">Deck Options</h2>
      </div>
      <div className="box">
        <LocalCheckbox
          storageKey="empty-description"
          heading="Deck Description"
          label="Empty description"
          startValue={false}
        />
        <div className="field">
          <strong>Deck Name</strong>
          <div className="control">
            <StyledInput
              className="input"
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
