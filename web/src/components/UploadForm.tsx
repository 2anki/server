import { SyntheticEvent, useState } from "react";
import StyledMessageBox from "./StyledMessageBox";
import ErrorMessage from "./ErrorMessage";
import DownloadModal from "./DownloadModal";

const UploadForm = () => {
  const notificationKey = "show-notification";
  const [showNotification, setShowNotification] = useState(
    localStorage.getItem(notificationKey) !== "false"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [deckName, setDeckName] = useState("");
  const [selectedFilename, setSelectedFilename] = useState("");

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    try {
      const storedFields = Object.entries(window.localStorage);
      const element = event.currentTarget as HTMLFormElement;
      const formData = new FormData(element);
      for (const sf of storedFields) {
        formData.append(sf[0], sf[1]);
      }
      const request = await window.fetch("/upload", {
        method: "post",
        body: formData,
      });
      const contentType = request.headers.get("Content-Type");
      const notOK = request.status !== 200;
      if (notOK) {
        const text = await request.text();
        return setErrorMessage(text);
      }
      let deckName = request.headers.get("File-Name");
      setDeckName(
        deckName || contentType === "application/zip"
          ? "Your Decks.zip"
          : "Your deck.apkg"
      );
      const blob = await request.blob();
      setDownloadLink(window.URL.createObjectURL(blob));
    } catch (error) {
      setErrorMessage(
        `<h1 class='title is-4'>${error.message}</h1><pre>${error.stack}</pre>`
      );
    }
  };

  const fileSelected = (event: { target: HTMLInputElement }) => {
    console.log(event.target.value);
    const filename = (() => {
      try {
        return event.target.value.split(/(\\|\/)/g).pop();
      } catch (err) {
        return "";
      }
    })();
    if (filename) setSelectedFilename(filename);
  };

  return (
    <form
      encType="multipart/form-data"
      method="post"
      onSubmit={(event) => {
        handleSubmit(event);
      }}
    >
      {errorMessage ? <ErrorMessage msg={errorMessage} /> : null}

      {/* Until we have onboarding, give new users some basic info */}
      {showNotification ? (
        <StyledMessageBox>
          <button
            className="delete"
            aria-label="close"
            onClick={() => {
              setShowNotification(false);
              window.localStorage.setItem(notificationKey, "false");
            }}
          />
          <p>
            We only support{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.notion.so/Export-as-HTML-bf3fe9e6920e4b9883cbd8a76b6128b7"
            >
              HTML
            </a>
            uploads from Notion.
          </p>
          <p>
            For tutorials checkout the official{" "}
            <a
              rel="noreferrer"
              target="_blank"
              href="https://www.youtube.com/playlist?list=PLzOAzzqpDqukOtwH3IYWiOhr_sjBjfgCd"
            >
              playlist
            </a>
          </p>
          <p style={{ fontWeight: "bold" }}>
            {" "}
            This project is 100% free and will remain free ✌️{" "}
            <span style={{ color: "grey", fontWeight: "normal" }}>
              #stillfree
            </span>
          </p>
        </StyledMessageBox>
      ) : null}
      <div className="field">
        <div className={`file is-centered is-boxed has-name is-large`}>
          <div className="field">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                name="pakker"
                accept=".zip,.html,.md"
                required
                multiple={true}
                onChange={(event) => {
                  fileSelected(event);
                }}
              />
              <span className="file-cta">
                <span className="file-label">Click to Upload...</span>
              </span>
              <span className="file-name">
                {selectedFilename || "My Notion Export.zip"}
              </span>
            </label>
            <button
              style={{ marginTop: "2rem" }}
              className="button cta is-large is-primary"
              type="submit"
              disabled={!selectedFilename}
            >
              Convert
            </button>
            {downloadLink && !errorMessage ? (
              <DownloadModal
                title={"Download Ready 🥳"}
                downloadLink={downloadLink}
                deckName={deckName}
              />
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;
