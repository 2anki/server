import { PDF_EXCEEDS_MAX_PAGE_LIMIT } from '../pdf/convertPDFToImages';

const LIMIT_MESSAGES = [
  'File too large',
  'You can only add 100 cards',
  'Your request has hit the limit',
  PDF_EXCEEDS_MAX_PAGE_LIMIT,
];

export const isLimitError = (error?: Error) => {
  if (!error) {
    return false;
  }
  return LIMIT_MESSAGES.some((msg) => error.message.includes(msg));
};
