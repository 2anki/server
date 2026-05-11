import { SyntheticEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import formStyles from '../../UploadPage/components/UploadForm/UploadForm.module.css';
import styles from '../../../styles/shared.module.css';

type PrintState = 'idle' | 'uploading' | 'done' | 'error';

const WRONG_TYPE_MESSAGE =
  'This tool works with Anki deck files (.apkg). To turn notes into an Anki deck, use the Upload page.';
const CORRUPTED_MESSAGE =
  "We couldn't read this file. Make sure it's a valid Anki deck (.apkg) and try again.";
const TOO_LARGE_MESSAGE =
  'This deck is too large to print right now. Try a deck with fewer cards.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong while generating the PDF. Please try again.';

function isApkgFile(name: string): boolean {
  return /\.apkg$/i.test(name);
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.clone().json();
    if (typeof body?.message === 'string' && body.message.trim().length > 0) {
      return body.message;
    }
  } catch {
    /* response not JSON */
  }
  return GENERIC_ERROR_MESSAGE;
}

function toUserMessage(serverMessage: string): string {
  if (/Invalid .apkg/i.test(serverMessage)) return CORRUPTED_MESSAGE;
  if (/PDF export supports up to/i.test(serverMessage)) return TOO_LARGE_MESSAGE;
  return serverMessage;
}

export default function PrintForm() {
  const [state, setState] = useState<PrintState>('idle');
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [dropHover, setDropHover] = useState(false);

  const resetForm = () => {
    setState('idle');
    setCardCount(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = async (file: File) => {
    if (!isApkgFile(file.name)) {
      setState('error');
      setErrorMessage(WRONG_TYPE_MESSAGE);
      return;
    }

    setState('uploading');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await globalThis.fetch('/api/apkg/pdf', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const name = file.name.replace(/\.apkg$/i, '.pdf');
        link.href = url;
        link.download = name;
        link.click();
        globalThis.URL.revokeObjectURL(url);

        setState('done');
        setCardCount(null);
      } else {
        const raw = await extractErrorMessage(response);
        setState('error');
        setErrorMessage(toUserMessage(raw));
      }
    } catch {
      setState('error');
      setErrorMessage(GENERIC_ERROR_MESSAGE);
    }
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    const files = fileInputRef.current?.files;
    if (files == null || files.length === 0) return;
    await handleFile(files[0]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDropHover(false);
    const { dataTransfer } = event;
    if (dataTransfer && dataTransfer.files.length > 0) {
      handleFile(dataTransfer.files[0]);
    }
  };

  const isUploading = state === 'uploading';

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="print-file"
        className={`${formStyles.dropZone} ${
          dropHover ? formStyles.dropZoneActive : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDropHover(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDropHover(true);
        }}
        onDragLeave={() => setDropHover(false)}
        onDrop={handleDrop}
      >
        <span className={formStyles.dropIcon}>🖨️</span>
        <span className={formStyles.dropText}>
          Drop an Anki deck (.apkg) here
        </span>
        <span className={formStyles.dropHint}>or</span>
        <span className={formStyles.convertButton}>
          {isUploading ? 'Making your PDF...' : 'Click to select a file'}
        </span>
        <input
          ref={fileInputRef}
          className={formStyles.fileInput}
          id="print-file"
          type="file"
          accept=".apkg"
          disabled={isUploading}
          onChange={() => submitRef.current?.click()}
        />
      </label>

      {state === 'done' && (
        <p className={styles.notificationSuccess}>
          Your flashcards as a PDF{cardCount == null ? '' : ` — ${cardCount} cards`}
        </p>
      )}

      {state === 'error' && errorMessage && (
        <p className={styles.notificationDanger}>
          {errorMessage}
          {errorMessage === WRONG_TYPE_MESSAGE && (
            <>
              {' '}
              <Link to="/upload">Go to Upload</Link>
            </>
          )}
        </p>
      )}

      {state === 'done' && (
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={resetForm}
          >
            Print another deck
          </button>
        </div>
      )}

      <button ref={submitRef} type="submit" className={styles.hidden} />
    </form>
  );
}
