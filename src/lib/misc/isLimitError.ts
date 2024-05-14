const LIMIT_MESSAGES = [
  'File too large',
  'You can only add 100 cards',
  'Your request has hit the limit',
];

export const isLimitError = (error?: Error) => {
  if (!error) {
    return false;
  }
  return LIMIT_MESSAGES.some((msg) => error.message.includes(msg));
};
