import Bugsnag from '@bugsnag/js';
import { getErrorMessage } from '../errors/helpers/getErrorMessage';

export const redirectOnError = (error: unknown) => {
  Bugsnag.notify(getErrorMessage(error));
  window.location.href = '/login#login';
};
