import { stripHtmlTags } from '../../../lib/text/stripHtmlTags';

export type ErrorHandlerType = (error: unknown) => void;

interface FriendlyError {
  title: string;
  detail?: string;
}

const FALLBACK: FriendlyError = {
  title: 'Something went wrong.',
  detail: 'Try again. If the problem keeps happening, email support@2anki.net.',
};

function toText(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message?: unknown }).message;
    if (typeof m === 'string') return m;
  }
  return '';
}

export function classifyError(error: unknown): FriendlyError {
  const raw = toText(error);

  if (!raw) return FALLBACK;

  const lower = raw.toLowerCase();

  // Network / offline — Chrome's fetch throws "TypeError: Failed to fetch"
  if (
    error instanceof TypeError ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed')
  ) {
    return {
      title: "Couldn't reach 2anki.",
      detail: 'Check your connection and try again.',
    };
  }

  if (
    lower.includes('econnreset') ||
    lower.includes('etimedout') ||
    lower.includes('econnrefused') ||
    lower.includes('gateway_timeout') ||
    lower.includes('service_unavailable')
  ) {
    return {
      title: 'The service is unreachable right now.',
      detail: 'This is usually temporary — try again in a moment.',
    };
  }

  if (lower.includes('rate_limited') || lower.includes('429')) {
    return {
      title: 'Too many requests.',
      detail:
        'Try again in a minute.',
    };
  }

  if (lower.includes('unauthorized') || lower.includes('401')) {
    return {
      title: 'Session expired.',
      detail: 'Sign in again to continue.',
    };
  }

  if (lower.includes('object_not_found') || lower.includes('404')) {
    return {
      title: "Couldn't find that page.",
      detail:
        'It may have been deleted in Notion, or access was revoked. Try reconnecting or choosing a different page.',
    };
  }

  if (lower.includes('upload_limit') || lower.includes('upload limit')) {
    return {
      title: "You've reached your monthly limit.",
      detail: 'Upgrade your plan to convert more decks this month.',
    };
  }

  const stripped = stripHtmlTags(raw);
  if (stripped.length > 0 && stripped.length < 280) {
    return { title: stripped };
  }

  return FALLBACK;
}

export const getErrorMessage = (error: unknown): string => {
  const friendly = classifyError(error);
  return friendly.detail
    ? `${friendly.title} ${friendly.detail}`
    : friendly.title;
};
