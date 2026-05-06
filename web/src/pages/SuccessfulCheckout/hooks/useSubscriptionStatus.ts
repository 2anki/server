import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SubscriptionStatus {
  authenticated: boolean;
  hasActiveSubscription: boolean;
  user?: {
    email: string;
    name: string;
    patreon: boolean;
  };
}

const fetchSubscriptionStatus = async (
  sessionId: string | null
): Promise<SubscriptionStatus> => {
  const url = sessionId
    ? `/api/stripe/subscription-status?session_id=${encodeURIComponent(
        sessionId
      )}`
    : '/api/stripe/subscription-status';
  const response = await fetch(url, {
    credentials: 'include',
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Subscription status check failed (${response.status}): ${body}`
    );
  }
  return response.json();
};

export const useSubscriptionStatus = () => {
  const [shouldPoll, setShouldPoll] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const sessionId = new URLSearchParams(globalThis.location.search).get(
    'session_id'
  );

  const query = useQuery({
    queryKey: ['subscription-status', sessionId],
    queryFn: () => fetchSubscriptionStatus(sessionId),
    refetchInterval: shouldPoll ? 2000 : false,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTimeoutReached(true);
      setShouldPoll(false);
    }, 90000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (query.data) {
      if (!query.data.authenticated) {
        setShouldPoll(false);
      }

      if (
        query.data.hasActiveSubscription ||
        (query.data.authenticated && timeoutReached)
      ) {
        const destination = query.data.authenticated
          ? '/account?subscribed=1'
          : '/notion';
        globalThis.location.href = destination;
      }
    }
  }, [query.data, timeoutReached]);

  return {
    ...query,
    timeoutReached,
    shouldShowLoading:
      query.isLoading ||
      (shouldPoll &&
        query.data?.authenticated &&
        !query.data?.hasActiveSubscription),
  };
};
