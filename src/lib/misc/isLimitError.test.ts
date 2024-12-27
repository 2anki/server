import { PDF_EXCEEDS_MAX_PAGE_LIMIT } from '../../infrastracture/adapters/fileConversion/convertPDFToImages';
import { isLimitError } from './isLimitError';

const MOCK_MSG =
  '<div class="content"><h3 class="title is-3">Your request has hit the limit</h3><ul><li>Split your request into multiple smaller ones (i.e.) make your upload size smaller.</li><li><div class="is-flex is-align-items-center"><a class="button is-success is-medium mr-2" href="https://buy.stripe.com/eVadTGcCI6Ny73qfZ0">Subscribe</a> for only $2 per month to remove all the limits.</div></li><li>Or <a href="https://alemayhu.com/patreon">Become a patron</a> to support me.</li></ul><p>If you already have an account, please <a href="/login?redirect=/upload">login</a> and try again. If you are still experiencing issues, please contact <a href="mailto:support@2anki.net">support@2anki.net</a>.</p></div>';

describe('isLimitError', () => {
  it('returns true ', () => {
    expect(isLimitError(new Error('File too large'))).toBe(true);
    expect(isLimitError(new Error('You can only add 100 cards'))).toBe(true);
    expect(isLimitError(new Error(PDF_EXCEEDS_MAX_PAGE_LIMIT))).toBe(true);
  });

  it('returns true for html', () => {
    expect(isLimitError(new Error(MOCK_MSG))).toBe(true);
  });

  it('returns false', () => {
    expect(isLimitError(new Error('File too small'))).toBe(false);
    expect(isLimitError()).toBe(false);
  });
});
