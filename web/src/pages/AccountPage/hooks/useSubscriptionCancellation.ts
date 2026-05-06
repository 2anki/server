import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  cancelSubscription,
  CancelMode,
} from '../../../lib/backend/cancelSubscription';
import { CancellationReason } from '../components/CancellationSurveyModal';

export function useSubscriptionCancellation(onSuccess?: () => void) {
  const [cancelError, setCancelError] = useState<string>('');
  const [cancelSuccess, setCancelSuccess] = useState<string>('');
  const [pendingMode, setPendingMode] = useState<CancelMode | null>(null);

  const { mutate, isPending: isCancelling } = useMutation({
    mutationFn: ({ mode, reason, comment }: { mode: CancelMode; reason: string; comment: string }) =>
      cancelSubscription(mode, reason, comment),
    onSuccess: (data) => {
      setCancelError('');
      setCancelSuccess(data?.message ?? 'Your subscription change has been processed.');
      onSuccess?.();
    },
    onError: (error: Error) => {
      setCancelSuccess('');
      setCancelError(error?.message || 'Failed to cancel subscription');
    },
  });

  const cancelUserSubscription = (mode: CancelMode = 'period_end') => {
    setPendingMode(mode);
  };

  const confirmCancellation = (reason: CancellationReason, comment: string) => {
    if (!pendingMode) return;
    setCancelError('');
    setCancelSuccess('');
    mutate({ mode: pendingMode, reason, comment });
    setPendingMode(null);
  };

  const dismissSurvey = () => setPendingMode(null);

  return {
    cancelUserSubscription,
    confirmCancellation,
    dismissSurvey,
    pendingMode,
    isCancelling,
    cancelError,
    cancelSuccess,
  };
}
