import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { postLinkEmail } from '../../../lib/backend/postLinkEmail';

export function useEmailLinking(onSuccess?: () => void) {
  const [linkEmail, setLinkEmail] = useState<string>('');
  const [linkError, setLinkError] = useState<string>('');
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  const { mutate: linkEmailMutate, isPending: isLinking } = useMutation({
    mutationFn: (email: string) => postLinkEmail(email),
    onError: (error: any) => {
      setLinkSuccess(false);
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Failed to link email';
      setLinkError(message);
    },
    onSuccess: async () => {
      setLinkError('');
      setLinkSuccess(true);
      onSuccess?.();
    },
  });

  const performLinkEmail = (email: string) => {
    linkEmailMutate(email);
  };

  const clearMessages = () => {
    setLinkError('');
    setLinkSuccess(false);
  };

  return {
    linkEmail,
    setLinkEmail,
    linkError,
    linkSuccess,
    isLinking,
    performLinkEmail,
    clearMessages,
  };
}
