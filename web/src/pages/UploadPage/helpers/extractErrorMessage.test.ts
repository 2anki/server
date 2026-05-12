import { extractErrorMessage } from './extractErrorMessage';

function jsonResponse(body: object, status = 400): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function textResponse(body: string, status = 400): Response {
  return new Response(body, { status });
}

describe('extractErrorMessage', () => {
  test('extracts message from JSON response body', async () => {
    const response = jsonResponse({ message: 'No active subscription.' });
    expect(await extractErrorMessage(response)).toBe(
      'No active subscription.'
    );
  });

  test('strips HTML tags from plain-text error response', async () => {
    const response = textResponse(
      '<p>Could not create a deck using your file</p>'
    );
    expect(await extractErrorMessage(response)).toBe(
      'Could not create a deck using your file'
    );
  });

  test('strips rich HTML with links from error response', async () => {
    const html =
      '<div class="info">Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your <a href="/upload?view=template">settings</a>.</div>';
    const response = textResponse(html);
    expect(await extractErrorMessage(response)).toBe(
      'Could not create a deck using your file(s) and rules. Make sure to at least create on valid toggle or verify your settings.'
    );
  });

  test('returns fallback for empty response body', async () => {
    const response = textResponse('');
    expect(await extractErrorMessage(response)).toMatch(
      /server rejected the upload/i
    );
  });

  test('returns fallback for very long response body', async () => {
    const response = textResponse('x'.repeat(600));
    expect(await extractErrorMessage(response)).toMatch(
      /server rejected the upload/i
    );
  });

  test('returns plain text when response is not JSON', async () => {
    const response = textResponse('Something broke on our end');
    expect(await extractErrorMessage(response)).toBe(
      'Something broke on our end'
    );
  });
});
