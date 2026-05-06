import Bugsnag from '@bugsnag/js';
import { getErrorMessage } from '../components/errors/helpers/getErrorMessage';

export function sendError(error: unknown) {
  Bugsnag.notify(getErrorMessage(error));
}
