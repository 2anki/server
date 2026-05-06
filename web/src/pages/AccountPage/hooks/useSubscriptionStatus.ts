import { useMemo } from 'react';

interface UserLocals {
  subscriber?: boolean;
  patreon?: boolean;
}

type SubscriptionType = 'subscriber' | 'lifetime' | 'free';

export function useSubscriptionStatus(locals: UserLocals | undefined) {
  const subscriptionType = useMemo((): SubscriptionType => {
    if (locals?.subscriber) return 'subscriber';
    if (locals?.patreon) return 'lifetime';
    return 'free';
  }, [locals?.subscriber, locals?.patreon]);

  const hasActivePlan = useMemo(() => {
    return Boolean(locals?.subscriber || locals?.patreon);
  }, [locals?.subscriber, locals?.patreon]);

  return {
    subscriptionType,
    hasActivePlan,
  };
}
