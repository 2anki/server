import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { ErrorHandlerType } from '../../../components/errors/helpers/types';
import getHeadersFilename from '../helpers/getHeadersFilename';
import DownloadButton from './DownloadButton';
import DropParagraph from './DropParagraph';

interface UploadFormProps {
  setErrorMessage: ErrorHandlerType;
}

function UploadForm({ setErrorMessage }: UploadFormProps) {
  const [uploading, setUploading] = useState(false);
  const [downloadLink, setDownloadLink] = useState<null | string>('');
  const [deckName, setDeckName] = useState('');
  const [dropHover, setDropHover] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);

  // TODO: refactor this into a hook
  // TODO: refactor into a hook
  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    body.ondragover = (event) => {
      setDropHover(true);
      event.preventDefault();
    };

    body.ondragenter = (event) => {
      event.preventDefault();
      setDropHover(true);
    };

    body.ondragleave = () => {
      setDropHover(false);
    };

    body.ondrop = (event) => {
      const { dataTransfer } = event;
      if (dataTransfer && dataTransfer.files.length > 0) {
        fileInputRef.current!.files = dataTransfer.files;
        convertRef.current?.click();
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
      storedFields.forEach((sf) => formData.append(sf[0], sf[1]));
      const request = await window.fetch('/api/upload/file', {
        method: 'post',
        body: formData,
      });
      const contentType = request.headers.get('Content-Type');
      const notOK = request.status !== 200;
      if (notOK) {
        const text = await request.text();
        setDownloadLink(null);
        return setErrorMessage(text);
      }
      const fileNameHeader = getHeadersFilename(request.headers);
      if (fileNameHeader) {
        setDeckName(fileNameHeader);
      } else {
        const fallback =
          contentType === 'application/zip'
            ? 'Your Decks.zip'
            : 'Your deck.apkg';
        setDeckName(fallback);
      }
      const blob = await request.blob();
      setDownloadLink(window.URL.createObjectURL(blob));
      setUploading(false);
    } catch (error) {
      setDownloadLink(null);
      setErrorMessage(error as Error);
      setUploading(false);
      return false;
    }
    return true;
  };

  const fileSelected = () => {
    convertRef.current?.click();
  };

  return (
    <form
      encType="multipart/form-data"
      method="post"
      onSubmit={(event) => {
        handleSubmit(event);
      }}
    >
      <div className="container">
        <div>
          <div className="field">
            <DropParagraph hover={dropHover}>
              Drag a file and Drop it here
              <p className="my-2">
                <i>or</i>
              </p>
              <label htmlFor="pakker">
                <input
                  ref={fileInputRef}
                  className="file-input"
                  type="file"
                  name="pakker"
                  accept=".zip,.html"
                  required
                  multiple
                  onChange={() => fileSelected()}
                />
              </label>
              <span className="tag">Select</span>
            </DropParagraph>
          </div>
          <DownloadButton
            downloadLink={downloadLink}
            deckName={deckName}
            uploading={uploading}
          />
          <button
            aria-label="Upload file"
            style={{ visibility: 'hidden' }}
            ref={convertRef}
            type="submit"
          />
        </div>
      </div>
    </form>
  );
}

export default UploadForm;
