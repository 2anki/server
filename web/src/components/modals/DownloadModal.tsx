import React from "react";

const TweetURL =
  "https://twitter.com/intent/tweet?text=Thank%20you%20%40AAlemayhu%20for%20saving%20me%20so%20much%20time%20with%20Notion%20to%20Anki%20%F0%9F%A4%A9%20Create%20flashcards%20faster%20on%20https%3A%2F%2F2anki.net%2Fupload";
const DownloadModal: React.FC<{
  title: string;
  downloadLink: string;
  deckName: string;
  onClickClose: React.MouseEventHandler;
}> = ({ title, downloadLink, deckName, onClickClose }) => {
  return (
    <div className="modal" style={{ display: "flex" }}>
      <div
        className="modal-background"
        style={{ background: "grey", opacity: "90%" }}
      ></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p style={{ textAlign: "center" }} className="modal-card-title">
            {title}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClickClose}
          />
        </header>
        <section className="modal-card-body">
          <div>
            <div className="has-text-centered">
              <a
                className="button is-primary is-large"
                style={{ margin: "2rem", fontWeight: "bold" }}
                href={downloadLink}
                download={deckName}
              >
                Download
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DownloadModal;
