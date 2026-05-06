import { SyntheticEvent, useRef, useState } from 'react';
import { ErrorHandlerType } from '../../../../components/errors/helpers/getErrorMessage';
import handleRedirect from '../../../../lib/handleRedirect';
import getAcceptedContentTypes from '../../helpers/getAcceptedContentTypes';
import getHeadersFilename from '../../helpers/getHeadersFilename';
import DownloadButton from '../DownloadButton';
import { useDrag } from './hooks/useDrag';
import formStyles from './UploadForm.module.css';
import styles from '../../../../styles/shared.module.css';

interface UploadFormProps {
  setErrorMessage: ErrorHandlerType;
  onFileSelected?: () => void;
}

const REJECTED_FALLBACK =
  'The server rejected the upload. Please try again or contact support@2anki.net.';
const NETWORK_FALLBACK =
  "We couldn't upload your file. Please check your connection and try again.";

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.clone().json();
    if (
      typeof body?.message === 'string' &&
      body.message.trim().length > 0
    ) {
      return body.message;
    }
  } catch {
    const text = await response.text().catch(() => '');
    if (
      text.length > 0 &&
      text.length < 500 &&
      !text.startsWith('<')
    ) {
      return text;
    }
  }
  return REJECTED_FALLBACK;
}

function toFriendlyThrownError(error: unknown): Error {
  const isNetworkError =
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network/i.test(error.message));
  if (isNetworkError) {
    return new Error(NETWORK_FALLBACK);
  }
  return error as Error;
}

function buildFormData(form: HTMLFormElement): FormData {
  const formData = new FormData(form);
  for (const [key, value] of Object.entries(globalThis.localStorage)) {
    formData.append(key, value);
  }
  return formData;
}

function parseCardCountHeader(headers: Headers): number | null {
  const cardCountHeader = headers.get('X-Card-Count');
  if (!cardCountHeader) return null;
  const parsed = Number.parseInt(cardCountHeader, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveDeckName(headers: Headers): string {
  const fileNameHeader = getHeadersFilename(headers);
  const fallback =
    headers.get('Content-Type') === 'application/zip'
      ? 'Your Decks.zip'
      : 'Your deck.apkg';
  return fileNameHeader ?? fallback;
}

function UploadForm({
  setErrorMessage,
  onFileSelected,
}: Readonly<UploadFormProps>) {
  const [uploading, setUploading] = useState(false);
  const [downloadLink, setDownloadLink] = useState<null | string>('');
  const [deckName, setDeckName] = useState('');
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);

  const { dropHover } = useDrag({
    onDrop: (event) => {
      const { dataTransfer } = event;
      if (dataTransfer && dataTransfer.files.length > 0) {
        fileInputRef.current!.files = dataTransfer.files;
        onFileSelected?.();
        convertRef.current?.click();
      }
      event.preventDefault();
    },
  });

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setUploading(true);
    try {
      const formData = buildFormData(event.currentTarget as HTMLFormElement);
      const request = await globalThis.fetch('/api/upload/file', {
        method: 'post',
        body: formData,
      });
      if (request.redirected) {
        return handleRedirect(request);
      }
      if (request.status === 202) {
        setUploading(false);
        globalThis.location.href = '/downloads';
        return true;
      }
      if (request.status !== 200) {
        const message = await extractErrorMessage(request);
        setDownloadLink(null);
        return setErrorMessage(new Error(message));
      }
      setWarningMessage(request.headers.get('X-Warning'));
      setDeckName(resolveDeckName(request.headers));
      setCardCount(parseCardCountHeader(request.headers));
      const blob = await request.blob();
      setDownloadLink(globalThis.URL.createObjectURL(blob));
      setUploading(false);
    } catch (error) {
      setDownloadLink(null);
      setErrorMessage(toFriendlyThrownError(error));
      setUploading(false);
      return false;
    }
    return true;
  };

  return (
    <form encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
      <label
        htmlFor="pakker"
        className={`${formStyles.dropZone} ${
          dropHover ? formStyles.dropZoneActive : ''
        }`}
      >
        <span className={formStyles.dropIcon}>📄</span>
        <span className={formStyles.dropText}>
          Drag and drop your files here
        </span>
        <span className={formStyles.dropHint}>or</span>
        <span className={formStyles.convertButton}>
          Click to convert your notes
        </span>
        <input
          ref={fileInputRef}
          className={formStyles.fileInput}
          id="pakker"
          type="file"
          name="pakker"
          accept={getAcceptedContentTypes()}
          required
          multiple
          onChange={() => {
            onFileSelected?.();
            convertRef.current?.click();
          }}
        />
      </label>
      <DownloadButton
        downloadLink={downloadLink}
        deckName={deckName}
        uploading={uploading}
        cardCount={cardCount}
      />
      {warningMessage && (
        <p className={styles.notificationWarning}>{warningMessage}</p>
      )}
      <button
        aria-label="Upload file"
        className={styles.hidden}
        ref={convertRef}
        type="submit"
      />
    </form>
  );
}

export default UploadForm;
