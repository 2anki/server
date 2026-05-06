export type ErrorHandlerType = (error: unknown) => void;

interface FriendlyError {
  title: string;
  detail?: string;
}

const FALLBACK: FriendlyError = {
  title: 'Something went wrong.',
  detail: 'Please try again. If the problem keeps happening, email support@2anki.net.',
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
      title: "We couldn't reach 2anki.",
      detail: 'Please check your connection and try again.',
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
        "We're throttled by the upstream service. Please try again in a minute.",
    };
  }

  if (lower.includes('unauthorized') || lower.includes('401')) {
    return {
      title: 'Please sign in again.',
      detail: 'Your session has expired.',
    };
  }

  if (lower.includes('object_not_found') || lower.includes('404')) {
    return {
      title: "We couldn't find that page.",
      detail:
        'It may have been deleted in Notion, or access was revoked. Try reconnecting or choosing a different page.',
    };
  }

  if (lower.includes('upload_limit') || lower.includes('upload limit')) {
    return {
      title: "You've reached your conversion limit.",
      detail: 'Upgrade your plan at /pricing to convert more decks.',
    };
  }

  // Server-provided message — trust it, it was already JSON { message: "..." }
  if (raw.length > 0 && raw.length < 280 && !raw.startsWith('<')) {
    return { title: raw };
  }

  return FALLBACK;
}

export const getErrorMessage = (error: unknown): string => {
  const friendly = classifyError(error);
  return friendly.detail
    ? `${friendly.title} ${friendly.detail}`
    : friendly.title;
};
