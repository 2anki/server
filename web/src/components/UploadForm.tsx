import { SyntheticEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ErrorMessage from "./ErrorMessage";

const DropParagraph = styled.div<{ hover: boolean }>`
  border: 1.3px dashed;
  border-radius: 3px;
  border-color: ${(props) => (props.hover ? "#5997f5" : "lightgray")};
  padding: 4rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 1rem;
`;

const UploadForm = () => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [deckName, setDeckName] = useState("");
  const [dropHover, setDropHover] = useState(false);

  const fileInputRef = useRef(null);
  const convertRef = useRef(null);
  const downloadRef = useRef(null);

  useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    body.ondragover = (event) => {
      setDropHover(true);
      event.preventDefault();
    };

    body.ondragenter = (event) => {
      event.preventDefault();
      setDropHover(true);
    };

    body.ondragleave = (_event) => {
      setDropHover(false);
    };

    body.ondrop = (event) => {
      const dataTransfer = event.dataTransfer;
      if (dataTransfer && dataTransfer.files.length > 0) {
        /* @ts-ignore */
        fileInputRef.current.files = dataTransfer.files;
        /* @ts-ignore */
        convertRef.current.click();
      }
      event.preventDefault();
    };
  }, []);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setUploading(true);
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
      const fileNameHeader = request.headers.get("File-Name".toLowerCase());
      if (fileNameHeader) {
        setDeckName(fileNameHeader);
      } else {
        let fallback =
          contentType === "application/zip"
            ? "Your Decks.zip"
            : "Your deck.apkg";
        setDeckName(fallback);
      }
      const blob = await request.blob();
      setDownloadLink(window.URL.createObjectURL(blob));
      setUploading(false);
    } catch (error) {
      setErrorMessage(
        `<h1 class='title is-4'>${error.message}</h1><pre>${error.stack}</pre>`
      );
      setUploading(false);
    }
  };

  const fileSelected = (event: { target: HTMLInputElement }) => {
    /* @ts-ignore */
    convertRef.current.click();
  };
  const isDownloadable = downloadLink && deckName && !errorMessage;

  return (
    <>
      <form
        encType="multipart/form-data"
        method="post"
        onSubmit={(event) => {
          handleSubmit(event);
        }}
      >
        {errorMessage && <ErrorMessage msg={errorMessage} />}

        <div>
          <div>
            <div className="field">
              <DropParagraph hover={dropHover}>
                Drag a file and Drop it here
                <p className="my-2">
                  <i>or</i>
                </p>
                <label>
                  <input
                    ref={fileInputRef}
                    className="file-input"
                    type="file"
                    name="pakker"
                    accept=".zip,.html"
                    required
                    multiple={true}
                    onChange={(event) => fileSelected(event)}
                  />
                  <span className="button">Select</span>
                </label>
              </DropParagraph>
            </div>
            <a
              ref={downloadRef}
              className={`button cta
              ${isDownloadable ? "is-primary" : "is-light"} 
              ${uploading ? "is-loading" : null}`}
              href={downloadLink}
              download={deckName}
              onClick={(event) => {
                if (!isDownloadable) {
                  event?.preventDefault();
                }
              }}
            >
              Download
            </a>
            <button
              style={{ visibility: "hidden" }}
              ref={convertRef}
              type="submit"
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default UploadForm;
