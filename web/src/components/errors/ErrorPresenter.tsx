import { ErrorAlertMessage } from '@fremtind/jkl-alert-message-react';
import { useState } from 'react';
import { getErrorMessage } from './helpers/getErrorMessage';
import { ErrorType } from './helpers/types';

interface ErrorPresenterProps {
  error: ErrorType;
}

export function ErrorPresenter({ error }: ErrorPresenterProps) {
  const [dismissed, setDismissed] = useState(false);
  if (!error) {
    return null;
  }
  return (
    <ErrorAlertMessage
      dismissed={dismissed}
      dismissAction={{
        handleDismiss: () => setDismissed(true),
      }}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: getErrorMessage(error) }} />
    </ErrorAlertMessage>
  );
}
