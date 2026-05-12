import { stripHtmlTags } from '../../../lib/text/stripHtmlTags';

const REJECTED_FALLBACK =
  'The server rejected the upload. Try again or email support@2anki.net.';

export async function extractErrorMessage(
  response: Response
): Promise<string> {
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
    const stripped = stripHtmlTags(text);
    if (stripped.length > 0 && stripped.length < 500) {
      return stripped;
    }
  }
  return REJECTED_FALLBACK;
}
