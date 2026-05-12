import { classifyError, getErrorMessage } from './getErrorMessage';

describe('classifyError', () => {
  test('TypeError: Failed to fetch is a network error', () => {
    const err = new TypeError('Failed to fetch');
    expect(classifyError(err).title).toMatch(/couldn't reach 2anki/i);
  });

  test('unauthorized message indicates session expired', () => {
    expect(classifyError(new Error('unauthorized')).title).toMatch(
      /session expired/i
    );
  });

  test('object_not_found gives a Notion-specific hint', () => {
    expect(classifyError(new Error('object_not_found')).detail).toMatch(
      /Notion/i
    );
  });

  test('upload_limit_exceeded suggests upgrading', () => {
    expect(
      classifyError(new Error('upload_limit_exceeded')).detail
    ).toMatch(/pricing/i);
  });

  test('rate_limited tells the user to wait', () => {
    expect(classifyError(new Error('rate_limited')).title).toMatch(
      /too many/i
    );
  });

  test('falls back to a short server message when one is provided', () => {
    expect(classifyError(new Error('No active subscription.')).title).toBe(
      'No active subscription.'
    );
  });

  test('unknown/empty error yields generic fallback', () => {
    expect(classifyError(undefined).title).toMatch(/Something went wrong/i);
  });

  test('HTML-looking long blobs fall back rather than leaking markup', () => {
    const ugly = '<html><body>big raw stack trace…</body></html>'.repeat(20);
    expect(classifyError(new Error(ugly)).title).toMatch(
      /Something went wrong/i
    );
  });

  test('short HTML-wrapped error is stripped and shown to the user', () => {
    const htmlError =
      '<p>Could not create a deck using your file</p>';
    const result = classifyError(new Error(htmlError));
    expect(result.title).toBe(
      'Could not create a deck using your file'
    );
  });

  test('rich HTML error with links is stripped to plain text', () => {
    const htmlError =
      '<div class="info">Verify your <a href="/upload?view=template">settings</a>.</div>';
    const result = classifyError(new Error(htmlError));
    expect(result.title).toBe('Verify your settings.');
  });
});

describe('getErrorMessage', () => {
  test('returns plain text — no HTML', () => {
    const msg = getErrorMessage(new Error('Failed to fetch'));
    expect(msg).not.toMatch(/</);
  });
});
