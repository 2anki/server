import { SyntheticEvent, useRef, useState } from 'react';
import { ErrorHandlerType } from '../../../../components/errors/helpers/getErrorMessage';
import handleRedirect from '../../../../lib/handleRedirect';
import getAcceptedContentTypes from '../../helpers/getAcceptedContentTypes';
import getHeadersFilename from '../../helpers/getHeadersFilename';
import DownloadButton from '../DownloadButton';
import { UploadLimitBanner } from '../UploadLimitBanner';
import { useDrag } from './hooks/useDrag';
import { useFileValidation } from './hooks/useFileValidation';
import formStyles from './UploadForm.module.css';
import styles from '../../../../styles/shared.module.css';

interface LimitInfo {
  isAnonymous: boolean;
  filename: string | null;
}

interface UploadFormProps {
  setErrorMessage: ErrorHandlerType;
  onFileSelected?: () => void;
}

const REJECTED_FALLBACK =
  'The server rejected the upload. Try again or email support@2anki.net.';
const NETWORK_FALLBACK =
  "Couldn't upload your file. Check your connection and try again.";

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
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);
  const { validation, validate, reset } = useFileValidation();

  const submitFiles = () => {
    convertRef.current?.click();
  };

  const { dropHover } = useDrag({
    onDrop: (event) => {
      const { dataTransfer } = event;
      if (dataTransfer && dataTransfer.files.length > 0) {
        fileInputRef.current!.files = dataTransfer.files;
        onFileSelected?.();
        if (validate(dataTransfer.files)) {
          submitFiles();
        }
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
        const redirectUrl = new URL(request.url, globalThis.location.origin);
        if (redirectUrl.searchParams.get('error') === 'upload_limit_exceeded') {
          const isAnonymous = redirectUrl.pathname === '/login';
          const firstFile = fileInputRef.current?.files?.[0];
          setLimitInfo({
            isAnonymous,
            filename: firstFile?.name ?? null,
          });
          setUploading(false);
          return true;
        }
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
        } ${
          validation?.status === 'warning' ? formStyles.dropZoneWarning : ''
        } ${
          validation?.status === 'error' ? formStyles.dropZoneError : ''
        } ${
          validation?.status === 'info' ? formStyles.dropZoneInfo : ''
        }`}
      >
        {validation ? (
          <>
            <span className={formStyles.dropIcon}>
              {validation.status === 'error' ? '⚠' : 'ℹ'}
            </span>
            <p className={formStyles.validationTitle}>{validation.title}</p>
            <p className={formStyles.validationBody}>{validation.body}</p>
            <div className={formStyles.validationActions}>
              <button
                type="button"
                className={formStyles.resetButton}
                onClick={(e) => {
                  e.preventDefault();
                  reset();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Pick a different file
              </button>
              <button
                type="button"
                className={formStyles.continueLink}
                onClick={(e) => {
                  e.preventDefault();
                  reset();
                  submitFiles();
                }}
              >
                {validation.continueLabel}
              </button>
            </div>
          </>
        ) : (
          <>
            <span className={formStyles.dropIcon}>📄</span>
            <span className={formStyles.dropText}>
              Drop your files here
            </span>
            <span className={formStyles.dropHint}>or</span>
            <span className={formStyles.convertButton}>
              Choose files
            </span>
          </>
        )}
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
            const files = fileInputRef.current?.files;
            if (files && validate(files)) {
              submitFiles();
            }
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
      {limitInfo && (
        <UploadLimitBanner
          filename={limitInfo.filename}
          isAnonymous={limitInfo.isAnonymous}
          onDismiss={() => {
            setLimitInfo(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
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
