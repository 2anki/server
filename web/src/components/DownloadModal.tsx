import React from "react";

const DownloadModal: React.FC<{
  title: string;
  downloadLink: string;
  deckName: string;
}> = ({ title, downloadLink, deckName }) => {
  return (
    <div className="modal" style={{ display: "flex" }}>
      <div className="modal-background">
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">{title}</p>
            <button className="delete" aria-label="close" />
          </header>
          <section className="modal-card-body">
            <div className="has-text-centered">
              <a
                className="button is-primary"
                style={{ margin: "2rem", fontWeight: "bold" }}
                href={downloadLink}
                download={deckName}
              >
                Download
              </a>
              <hr />
              <h3 className="title is-3"> Please Support Open Source 🙏🏾</h3>
              <p>
                You can directly support the development and accelerate the
                improvements!
              </p>
              <p>
                Pick your price ranging starting from <strong>"$1"</strong>.
              </p>
              <p>
                This deck is brought to you by our amazing{" "}
                <a href="https://www.patreon.com/alemayhu">patrons</a> 🤩
              </p>
              <div>
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://www.patreon.com/alemayhu"
                >
                  <img
                    alt="Become a patreon button"
                    src="become_a_patron_button.png"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
