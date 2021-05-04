import React from "react";

import { Modal, Button } from "trunx";

const SettingsModal: React.FC<{
  isActive: boolean;
  onClickClose: React.MouseEventHandler;
}> = ({ isActive, onClickClose }) => {
  return (
    <Modal isActive={isActive}>
      <Modal.Background></Modal.Background>
      <Modal.Card>
        <Modal.Card.Head>
          <Modal.Card.Title>Modal title</Modal.Card.Title>
          <button
            className="delete"
            aria-label="close"
            onClick={onClickClose}
          ></button>
        </Modal.Card.Head>
        <Modal.Card.Body>{/* Content  */}</Modal.Card.Body>
        <footer className="modal-card-foot">
          <Button isPrimary>Save changes</Button>
          <Button>Cancel</Button>
        </footer>
      </Modal.Card>
    </Modal>
  );
};

export default SettingsModal;
