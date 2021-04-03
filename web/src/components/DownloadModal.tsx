import React from "react";

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
            <hr />
            <h3 className="title is-3"> Please Support Open Source 🙏🏾</h3>
            <p>
              You can directly support the development and accelerate the
              improvements! Pick your price ranging starting from{" "}
              <strong>$1</strong>. This deck is brought to you by our amazing{" "}
              <span> </span>
              <a href="https://www.patreon.com/alemayhu">patrons</a> 🤩
            </p>
            <div className="has-text-centered">
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
            <div>
              <p>
                Not comfortable with reocurring expense? No worries, you can
                send one-time contributions with{" "}
                <a href="https://ko-fi.com/alemayhu">Ko-Fi</a>
              </p>
              <div className="has-text-centered">
                <a
                  rel="noreferrer"
                  href="https://ko-fi.com/W7W6QZNY"
                  target="_blank"
                >
                  <img
                    height="36"
                    style={{ border: "0px", height: "36px" }}
                    src="https://cdn.ko-fi.com/cdn/kofi1.png?v=2"
                    alt="Buy Me a Coffee at ko-fi.com"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DownloadModal;
