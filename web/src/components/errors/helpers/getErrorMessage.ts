import { ErrorType } from './types';

export const getErrorMessage = (error: ErrorType): string => {
  let msg = 'Unknown error';
  if (error instanceof Error) {
    msg = `<h1 class='title is-4'>${error.message}</h1>`;
  }
  return msg;
};
