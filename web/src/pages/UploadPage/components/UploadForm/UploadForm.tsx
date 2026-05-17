import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorHandlerType } from '../../../../components/errors/helpers/getErrorMessage';
import handleRedirect from '../../../../lib/handleRedirect';
import getAcceptedContentTypes from '../../helpers/getAcceptedContentTypes';
import { extractErrorMessage } from '../../helpers/extractErrorMessage';
import getHeadersFilename from '../../helpers/getHeadersFilename';
import { getDownloadFileName } from '../../../DownloadsPage/helpers/getDownloadFileName';
import { useDrag } from './hooks/useDrag';
import { useFileValidation } from './hooks/useFileValidation';
import { useDropboxChooser, type DropboxFile } from './hooks/useDropboxChooser';
import {
  useGooglePicker,
  type GoogleDriveFile,
} from './hooks/useGooglePicker';
import { UploadSourceChips, type UploadSource } from './UploadSourceChips';
import { FeedbackWidget } from '../../../../components/FeedbackWidget/FeedbackWidget';
import { useUserLocals } from '../../../../lib/hooks/useUserLocals';
import { get2ankiApi } from '../../../../lib/backend/get2ankiApi';
import { fireAnalyticsEvent } from '../../../../lib/analytics/fireAnalyticsEvent';
import { track } from '../../../../lib/analytics/track';
import formStyles from './UploadForm.module.css';
import sharedStyles from '../../../../styles/shared.module.css';

type ZoneState =
  | 'idle'
  | 'converting'
  | 'success'
  | 'emptyDeck'
  | 'limitReached'
  | 'error';

interface LimitInfo {
  isAnonymous: boolean;
  filename: string | null;
}

interface UploadFormProps {
  setErrorMessage: ErrorHandlerType;
}

const FORMATS = ['.zip', '.html', '.md', '.pdf', '.docx', '.xlsx', '.pptx', '.csv'];

const REJECTED_FALLBACK =
  'The server rejected the upload. Try again or email support@2anki.net.';
const NETWORK_FALLBACK =
  "Couldn't upload your file. Check your connection and try again.";

function toFriendlyThrownError(error: unknown): string {
  const isNetworkError =
    error instanceof TypeError ||
    (error instanceof Error && /fetch|network/i.test(error.message));
  if (isNetworkError) return NETWORK_FALLBACK;
  if (error instanceof Error) return error.message;
  return REJECTED_FALLBACK;
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

function displayFilename(fileInput: HTMLInputElement | null): string {
  const files = fileInput?.files;
  if (!files || files.length === 0) return '';
  if (files.length === 1) return files[0].name;
  return `${files.length} files`;
}

function UploadCloudIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 32L24 24L32 32" />
      <path d="M24 24V42" />
      <path d="M40.78 35.61A8 8 0 0038 20H35.28A12.8 12.8 0 1010 28.67" />
      <path d="M16 32L24 24L32 32" />
    </svg>
  );
}

function CheckCircleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" />
      <path d="M16 24L22 30L34 18" />
    </svg>
  );
}

function DropboxIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 4l8 5-8 5-8-5 8-5zm16 0l8 5-8 5-8-5 8-5zM0 19l8-5 8 5-8 5-8-5zm24-5l8 5-8 5-8-5 8-5zM8 26l8-5 8 5-8 5-8-5z" />
    </svg>
  );
}

function GoogleDriveIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11 4h10l10 17.5h-10L11 4zm-1 1.7L0 23.2 5 32h10L5 14.5 10 5.7zM10.5 23.5h21L26.5 32H5.5l5-8.5z" />
    </svg>
  );
}

function WarningIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.07 6.73L3.51 38a3.2 3.2 0 002.93 4.8h35.12a3.2 3.2 0 002.93-4.8L26.93 6.73a3.2 3.2 0 00-5.86 0z" />
      <line x1="24" y1="18" x2="24" y2="28" />
      <circle cx="24" cy="34" r="0.5" fill="currentColor" />
    </svg>
  );
}

function UploadForm({ setErrorMessage }: Readonly<UploadFormProps>) {
  const [zoneState, setZoneState] = useState<ZoneState>('idle');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [cardCount, setCardCount] = useState<number | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [progressWidth, setProgressWidth] = useState(10);
  const [progressSlow, setProgressSlow] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [trialPending, setTrialPending] = useState(false);
  const [dropboxFilename, setDropboxFilename] = useState<string | null>(null);
  const [dropboxPending, setDropboxPending] = useState(false);
  const [dropboxError, setDropboxError] = useState<string | null>(null);
  const [driveFilename, setDriveFilename] = useState<string | null>(null);
  const [driveMimeType, setDriveMimeType] = useState<string | null>(null);
  const [drivePending, setDrivePending] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [source, setSource] = useState<UploadSource>('local');
  const { data: userLocals } = useUserLocals();
  const queryClient = useQueryClient();
  const showTrialButton =
    !limitInfo?.isAnonymous &&
    userLocals?.user?.trial_started_at == null &&
    userLocals?.locals?.patreon !== true;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const convertRef = useRef<HTMLButtonElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { validation, validate, reset: resetValidation } = useFileValidation();
  const { openChooser, isConfigured: isDropboxConfigured } = useDropboxChooser(FORMATS);
  const { openPicker, isConfigured: isGoogleDriveConfigured } = useGooglePicker();

  const handleStartTrial = async () => {
    setTrialPending(true);
    try {
      const result = await get2ankiApi().startTrial();
      if (result.ok) {
        await queryClient.invalidateQueries({ queryKey: ['userLocals'] });
        resetForm();
      }
    } finally {
      setTrialPending(false);
    }
  };

  const submitFiles = () => {
    convertRef.current?.click();
  };

  const resetForm = () => {
    setZoneState('idle');
    setDownloadLink(null);
    setDeckName('');
    setCardCount(null);
    setWarningMessage(null);
    setLimitInfo(null);
    setLocalError(null);
    setProgressWidth(10);
    setProgressSlow(false);
    setShowFallback(false);
    setDropboxFilename(null);
    setDropboxError(null);
    setDriveFilename(null);
    setDriveMimeType(null);
    setDriveError(null);
    setSource('local');
    resetValidation();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }
  };

  const { dropHover } = useDrag({
    onDrop: (event) => {
      const { dataTransfer } = event;
      if (dataTransfer && dataTransfer.files.length > 0) {
        fileInputRef.current!.files = dataTransfer.files;
        if (validate(dataTransfer.files)) {
          submitFiles();
        }
      }
      event.preventDefault();
    },
  });

  useEffect(() => {
    if (zoneState === 'success' && downloadLink && !showFallback) {
      if (cardCount !== 0) {
        fireAnalyticsEvent('deck_downloaded');
        track('deck_downloaded');
        downloadRef.current?.click();
      }
      fallbackTimerRef.current = setTimeout(() => {
        setShowFallback(true);
      }, 3000);
    }
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [zoneState, downloadLink]);

  useEffect(() => {
    if (zoneState !== 'converting') return;
    setProgressWidth(70);
    const timer = setTimeout(() => {
      setProgressSlow(true);
      setProgressWidth(90);
    }, 2000);
    return () => clearTimeout(timer);
  }, [zoneState]);

  useEffect(() => {
    if (zoneState === 'error') {
      track('upload_error_chat_shown');
    }
  }, [zoneState]);

  const handleDropboxFiles = async (files: DropboxFile[]) => {
    const first = files[0];
    setDropboxFilename(first?.name ?? null);
    setDropboxError(null);
    setZoneState('converting');
    fireAnalyticsEvent('upload_started');
    setProgressWidth(10);
    setProgressSlow(false);
    setShowFallback(false);
    try {
      const formData = new FormData();
      formData.append('files', JSON.stringify(files));
      for (const [key, value] of Object.entries(globalThis.localStorage)) {
        formData.append(key, value);
      }
      const request = await globalThis.fetch('/api/upload/dropbox', {
        method: 'post',
        body: formData,
      });
      if (request.redirected) {
        const redirectUrl = new URL(request.url, globalThis.location.origin);
        if (redirectUrl.searchParams.get('error') === 'upload_limit_exceeded') {
          const isAnonymous = redirectUrl.pathname === '/login';
          setLimitInfo({ isAnonymous, filename: first?.name ?? null });
          setZoneState('limitReached');
          return;
        }
        handleRedirect(request);
        return;
      }
      if (request.status === 202) {
        globalThis.location.href = '/downloads';
        return;
      }
      if (request.status !== 200) {
        const message = await extractErrorMessage(request);
        setLocalError(message);
        setZoneState('error');
        return;
      }
      setWarningMessage(request.headers.get('X-Warning'));
      setDeckName(resolveDeckName(request.headers));
      const count = parseCardCountHeader(request.headers);
      setCardCount(count);
      const blob = await request.blob();
      setDownloadLink(globalThis.URL.createObjectURL(blob));
      setProgressWidth(100);
      if (count === 0) {
        setZoneState('emptyDeck');
      } else {
        fireAnalyticsEvent('conversion_success');
        setZoneState('success');
      }
    } catch (error) {
      setLocalError(toFriendlyThrownError(error));
      setZoneState('error');
    }
  };

  const handleDropboxClick = async () => {
    setDropboxError(null);
    setDropboxPending(true);
    try {
      const outcome = await openChooser();
      if (outcome.kind === 'cancelled') return;
      if (outcome.files.length === 0) return;
      await handleDropboxFiles(outcome.files);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't open Dropbox. Try again in a moment.";
      setDropboxError(message);
    } finally {
      setDropboxPending(false);
    }
  };

  const handleGoogleDriveFiles = async (
    files: GoogleDriveFile[],
    accessToken: string
  ) => {
    const first = files[0];
    setDriveFilename(first?.name ?? null);
    setDriveMimeType(first?.mimeType ?? null);
    setDriveError(null);
    setZoneState('converting');
    fireAnalyticsEvent('upload_started');
    setProgressWidth(10);
    setProgressSlow(false);
    setShowFallback(false);
    try {
      const formData = new FormData();
      formData.append('files', JSON.stringify(files));
      formData.append('googleDriveAuth', accessToken);
      for (const [key, value] of Object.entries(globalThis.localStorage)) {
        formData.append(key, value);
      }
      const request = await globalThis.fetch('/api/upload/google_drive', {
        method: 'post',
        body: formData,
      });
      if (request.redirected) {
        const redirectUrl = new URL(request.url, globalThis.location.origin);
        if (redirectUrl.searchParams.get('error') === 'upload_limit_exceeded') {
          const isAnonymous = redirectUrl.pathname === '/login';
          setLimitInfo({ isAnonymous, filename: first?.name ?? null });
          setZoneState('limitReached');
          return;
        }
        handleRedirect(request);
        return;
      }
      if (request.status === 202) {
        globalThis.location.href = '/downloads';
        return;
      }
      if (request.status !== 200) {
        const message = await extractErrorMessage(request);
        setLocalError(message);
        setZoneState('error');
        return;
      }
      setWarningMessage(request.headers.get('X-Warning'));
      setDeckName(resolveDeckName(request.headers));
      const count = parseCardCountHeader(request.headers);
      setCardCount(count);
      const blob = await request.blob();
      setDownloadLink(globalThis.URL.createObjectURL(blob));
      setProgressWidth(100);
      if (count === 0) {
        setZoneState('emptyDeck');
      } else {
        fireAnalyticsEvent('conversion_success');
        setZoneState('success');
      }
    } catch (error) {
      setLocalError(toFriendlyThrownError(error));
      setZoneState('error');
    }
  };

  const handleGoogleDriveClick = async () => {
    setDriveError(null);
    setDrivePending(true);
    try {
      const outcome = await openPicker();
      if (outcome.kind === 'cancelled') return;
      if (outcome.files.length === 0) return;
      await handleGoogleDriveFiles(outcome.files, outcome.accessToken);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Couldn't reach Google Drive. Sign in again and retry.";
      setDriveError(message);
    } finally {
      setDrivePending(false);
    }
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();
    setZoneState('converting');
    fireAnalyticsEvent('upload_started');
    setProgressWidth(10);
    setProgressSlow(false);
    setShowFallback(false);
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
          setZoneState('limitReached');
          return true;
        }
        return handleRedirect(request);
      }
      if (request.status === 202) {
        globalThis.location.href = '/downloads';
        return true;
      }
      if (request.status !== 200) {
        const message = await extractErrorMessage(request);
        setLocalError(message);
        setZoneState('error');
        return false;
      }
      setWarningMessage(request.headers.get('X-Warning'));
      setDeckName(resolveDeckName(request.headers));
      const count = parseCardCountHeader(request.headers);
      setCardCount(count);
      const blob = await request.blob();
      setDownloadLink(globalThis.URL.createObjectURL(blob));
      setProgressWidth(100);
      if (count === 0) {
        setZoneState('emptyDeck');
      } else {
        fireAnalyticsEvent('conversion_success');
        setZoneState('success');
      }
    } catch (error) {
      setLocalError(toFriendlyThrownError(error));
      setZoneState('error');
      return false;
    }
    return true;
  };

  const zoneClassName = [
    formStyles.dropZone,
    dropHover && zoneState === 'idle' ? formStyles.dropZoneActive : '',
    zoneState === 'converting' ? formStyles.dropZoneConverting : '',
    zoneState === 'success' ? formStyles.dropZoneSuccess : '',
    zoneState === 'emptyDeck' ? formStyles.dropZoneEmpty : '',
    zoneState === 'error' ? formStyles.dropZoneError : '',
    zoneState === 'limitReached' ? formStyles.dropZoneLimit : '',
    validation?.status === 'warning' ? formStyles.dropZoneWarning : '',
    validation?.status === 'error' ? formStyles.dropZoneError : '',
    validation?.status === 'info' ? formStyles.dropZoneInfo : '',
  ]
    .filter(Boolean)
    .join(' ');

  const renderValidationState = () => (
    <div className={formStyles.stateContent}>
      <span className={formStyles.validationIcon}>
        {validation?.status === 'error' ? '⚠' : 'ℹ'}
      </span>
      <p className={formStyles.validationTitle}>{validation?.title}</p>
      <p className={formStyles.validationBody}>{validation?.body}</p>
      <div className={formStyles.validationActions}>
        <button
          type="button"
          className={formStyles.actionButton}
          onClick={(e) => {
            e.preventDefault();
            resetValidation();
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        >
          Pick a different file
        </button>
        <button
          type="button"
          className={formStyles.resetLink}
          onClick={(e) => {
            e.preventDefault();
            resetValidation();
            submitFiles();
          }}
        >
          {validation?.continueLabel}
        </button>
      </div>
    </div>
  );

  const remoteSourceLabel = (): string | null => {
    if (driveFilename) return 'Google Drive';
    if (dropboxFilename) return 'Dropbox';
    return null;
  };

  const renderConvertingState = () => {
    const remoteFilename = driveFilename ?? dropboxFilename;
    const remoteSource = remoteSourceLabel();
    return (
      <div className={formStyles.stateContent}>
        <p className={formStyles.filename}>
          {remoteFilename ?? displayFilename(fileInputRef.current)}
        </p>
        <div className={formStyles.progressTrack}>
          <div
            className={`${formStyles.progressFill} ${progressSlow ? formStyles.progressFillSlow : ''}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <p className={formStyles.statusText}>
          {remoteFilename && remoteSource
            ? `Fetching ${remoteFilename} from ${remoteSource}`
            : 'Making your deck...'}
        </p>
      </div>
    );
  };

  const renderSuccessState = () => (
    <div className={formStyles.stateContent}>
      <CheckCircleIcon className={formStyles.iconSuccess} />
      <p className={formStyles.successPrimary}>
        Your deck is ready
        {cardCount != null && (
          <span className={formStyles.cardCount}>
            &nbsp;&mdash; {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        )}
      </p>
      <p className={formStyles.successSecondary}>
        {deckName} was saved to your downloads
      </p>
      {warningMessage && (
        <p className={formStyles.warningInline}>{warningMessage}</p>
      )}
      {showFallback && (
        <button
          type="button"
          className={formStyles.fallbackLink}
          onClick={() => downloadRef.current?.click()}
        >
          Didn't get the file? Download it here.
        </button>
      )}
      <button
        type="button"
        className={formStyles.actionButton}
        onClick={resetForm}
      >
        Make another deck
      </button>
      <div className={formStyles.feedbackPrompt}>
        <p className={formStyles.feedbackLabel}>How was your experience?</p>
        <FeedbackWidget page="/upload" compact />
      </div>
    </div>
  );

  const renderEmptyDeckBody = () => {
    if (driveMimeType === 'application/vnd.google-apps.document') {
      return (
        <p className={formStyles.emptyBody}>
          Your Doc converted, but we didn't see the bullet shape we turn into cards.
          Restructure your Doc so each question is a top-level bullet with its answer
          indented underneath, then try again.{' '}
          <a href="/documentation/help/common-problems#my-google-doc-converted-to-0-cards">
            See a working example
          </a>
        </p>
      );
    }
    if (driveMimeType === 'application/vnd.google-apps.spreadsheet') {
      return (
        <p className={formStyles.emptyBody}>
          Sheets need a column of questions and a column of answers. Make sure your
          Sheet has at least two columns, then try again.
        </p>
      );
    }
    if (driveMimeType === 'application/vnd.google-apps.presentation') {
      return (
        <p className={formStyles.emptyBody}>
          Slides need a title and bullets per slide to produce cards. Add titles and
          bullet points to your slides, then try again.
        </p>
      );
    }
    return (
      <>
        <p className={formStyles.emptyBody}>
          2anki turns Notion toggle blocks (the little triangles you click to
          expand) into flashcards. We didn't find any toggles in this file.
        </p>
        <p className={formStyles.emptyBody}>
          If this came from Notion, open the page, add some toggle blocks, and
          export again.{' '}
          <a href="/documentation/help/common-problems#could-not-create-a-deck-using-your-file-and-rules">
            See examples
          </a>
          .
        </p>
      </>
    );
  };

  const renderEmptyDeckState = () => {
    const isGoogleDriveFile = driveMimeType?.startsWith('application/vnd.google-apps.') ?? false;
    const emptyTitle = isGoogleDriveFile
      ? `No cards found in ${driveFilename ?? 'your file'}`
      : 'No cards found in this file';

    return (
      <div className={formStyles.stateContent}>
        <WarningIcon className={formStyles.iconWarning} />
        <p className={formStyles.emptyTitle}>{emptyTitle}</p>
        {renderEmptyDeckBody()}
        <div className={formStyles.emptyActions}>
          <button
            type="button"
            className={formStyles.emptyDownloadButton}
            onClick={() => downloadRef.current?.click()}
          >
            Download empty deck
          </button>
          <button
            type="button"
            className={formStyles.resetLink}
            onClick={resetForm}
          >
            Try a different file
          </button>
          <Link to={chatCtaHref('empty')} className={formStyles.resetLink}>
            Stuck? Ask Claude about this file →
          </Link>
        </div>
      </div>
    );
  };

  const renderLimitState = () => (
    <div className={formStyles.limitContent}>
      <p className={formStyles.limitTitle}>
        You've reached your monthly limit
      </p>
      <p className={formStyles.limitDescription}>
        {limitInfo?.isAnonymous
          ? 'Create a free account to keep converting, or upgrade for unlimited decks.'
          : 'Upgrade your plan to continue converting files.'}
      </p>
      {limitInfo?.filename && (
        <span className={formStyles.limitFilename}>
          {limitInfo.filename}
        </span>
      )}
      <div className={formStyles.limitActions}>
        {limitInfo?.isAnonymous ? (
          <Link
            to="/register?redirect=/upload"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
          >
            Create free account
          </Link>
        ) : (
          <Link
            to="/pricing"
            className={`${sharedStyles.btnPrimary} ${sharedStyles.btnInline}`}
          >
            Upgrade to continue
          </Link>
        )}
        {showTrialButton && (
          <button
            type="button"
            className={`${sharedStyles.btnSecondary} ${sharedStyles.btnInline}`}
            onClick={handleStartTrial}
            disabled={trialPending}
          >
            {trialPending ? 'Starting trial…' : 'Start 1-hour trial'}
          </button>
        )}
        <button
          type="button"
          className={formStyles.resetLink}
          onClick={resetForm}
        >
          Try a different file
        </button>
      </div>
    </div>
  );

  const currentFilename = (): string =>
    driveFilename ?? dropboxFilename ?? displayFilename(fileInputRef.current);

  const chatCtaHref = (reason: 'error' | 'empty' | 'unsupported'): string => {
    const filename = currentFilename();
    const params = new URLSearchParams({ from: 'upload', reason });
    if (filename) params.set('filename', filename);
    return `/chat?${params.toString()}`;
  };

  const renderErrorState = () => (
    <div className={formStyles.stateContent}>
      <WarningIcon className={formStyles.iconError} />
      <p className={formStyles.errorTitle}>Something went wrong</p>
      <p className={formStyles.errorBody}>
        {localError ??
          "We couldn't make your deck. Try again, or email us at support@2anki.net."}
      </p>
      <button
        type="button"
        className={formStyles.actionButton}
        onClick={resetForm}
      >
        Try again
      </button>
      <Link
        to={chatCtaHref('error')}
        className={formStyles.resetLink}
        onClick={() => track('upload_error_chat_engaged')}
      >
        Stuck? Ask Claude about this file →
      </Link>
    </div>
  );

  const renderIdleState = () => (
    <div className={formStyles.stateContent}>
      <UploadCloudIcon
        className={`${formStyles.icon} ${dropHover ? formStyles.iconBob : ''}`}
      />
      <span className={formStyles.dropText}>
        {dropHover ? 'Drop it right here' : 'Drop your files here'}
      </span>
      {!dropHover && (
        <>
          <span className={formStyles.dropHint}>or</span>
          <span className={formStyles.chooseButton}>Choose files</span>
          <div className={formStyles.formatList}>
            {FORMATS.map((fmt) => (
              <span key={fmt} className={formStyles.formatPill}>
                {fmt}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderZoneContent = () => {
    if (validation && zoneState === 'idle') return renderValidationState();
    if (zoneState === 'converting') return renderConvertingState();
    if (zoneState === 'success') return renderSuccessState();
    if (zoneState === 'emptyDeck') return renderEmptyDeckState();
    if (zoneState === 'limitReached' && limitInfo) return renderLimitState();
    if (zoneState === 'error') return renderErrorState();
    return renderIdleState();
  };

  const showChips = zoneState === 'idle' && !validation;
  const showDropboxPanel = showChips && source === 'dropbox';
  const showGoogleDrivePanel = showChips && source === 'google_drive';
  const showLocalPanel = !showChips || source === 'local';

  const renderLiveStatus = (): string => {
    if (zoneState === 'converting') return 'Converting your file.';
    if (zoneState === 'success') {
      const count = cardCount == null
        ? ''
        : `${cardCount} ${cardCount === 1 ? 'card' : 'cards'}`;
      return `Your deck is ready${count ? ` — ${count}` : ''}.`;
    }
    if (zoneState === 'emptyDeck') {
      return 'Conversion finished, but no cards were found.';
    }
    if (zoneState === 'error') return 'Conversion failed.';
    if (zoneState === 'limitReached') {
      return "You've reached your monthly limit.";
    }
    return '';
  };

  return (
    <form encType="multipart/form-data" method="post" onSubmit={handleSubmit}>
      <output aria-live="polite" className={sharedStyles.srOnly}>
        {renderLiveStatus()}
      </output>
      <label
        htmlFor="pakker"
        id="upload-panel-local"
        className={`${zoneClassName} ${showLocalPanel ? '' : formStyles.panelHidden}`}
        aria-hidden={!showLocalPanel}
      >
        {renderZoneContent()}
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
            const files = fileInputRef.current?.files;
            if (files && validate(files)) {
              submitFiles();
            }
          }}
        />
      </label>
      {showChips && (
        <div
          id="upload-panel-dropbox"
          className={`${zoneClassName} ${showDropboxPanel ? '' : formStyles.panelHidden}`}
          aria-hidden={!showDropboxPanel}
        >
          <div className={formStyles.stateContent}>
            <DropboxIcon className={formStyles.dropboxIconLarge} />
            <span className={formStyles.dropText}>
              Pick a file from your Dropbox to convert it into a deck
            </span>
            <button
              type="button"
              className={formStyles.chooseButton}
              onClick={handleDropboxClick}
              disabled={dropboxPending}
              aria-label="Choose from Dropbox"
            >
              {dropboxPending ? 'Opening Dropbox' : 'Choose from Dropbox'}
            </button>
            <div className={formStyles.formatList}>
              {FORMATS.map((fmt) => (
                <span key={fmt} className={formStyles.formatPill}>
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {dropboxError && (
        <p className={formStyles.dropboxError} role="alert">
          {dropboxError}
        </p>
      )}
      {showChips && isGoogleDriveConfigured && (
        <div
          id="upload-panel-google-drive"
          className={`${zoneClassName} ${showGoogleDrivePanel ? '' : formStyles.panelHidden}`}
          aria-hidden={!showGoogleDrivePanel}
        >
          <div className={formStyles.stateContent}>
            <GoogleDriveIcon className={formStyles.dropboxIconLarge} />
            <span className={formStyles.dropText}>
              Pick a Doc, Sheet, Slide, or file from your Google Drive.
            </span>
            <span className={formStyles.dropHint}>
              Docs work best as a bulleted outline — top bullet asks, indented bullet answers.
            </span>
            <button
              type="button"
              className={formStyles.chooseButton}
              onClick={handleGoogleDriveClick}
              disabled={drivePending}
              aria-label="Choose from Google Drive"
            >
              {drivePending ? 'Opening Google Drive' : 'Choose from Google Drive'}
            </button>
            <div className={formStyles.formatList}>
              {FORMATS.map((fmt) => (
                <span key={fmt} className={formStyles.formatPill}>
                  {fmt}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {driveError && (
        <p className={formStyles.dropboxError} role="alert">
          {driveError}
        </p>
      )}
      {showChips && (
        <div className={formStyles.chipsRow}>
          <UploadSourceChips
            active={source}
            onChange={setSource}
            dropboxAvailable={isDropboxConfigured}
            googleDriveAvailable={isGoogleDriveConfigured}
          />
        </div>
      )}
      {downloadLink && (
        <a
          hidden
          target="_blank"
          aria-label="download link"
          href={downloadLink}
          download={getDownloadFileName(deckName || 'Untitled')}
          ref={downloadRef}
          rel="noreferrer"
        >
          {downloadLink}
        </a>
      )}
      <button
        aria-label="Upload file"
        className={sharedStyles.hidden}
        ref={convertRef}
        type="submit"
      />
    </form>
  );
}

export default UploadForm;
