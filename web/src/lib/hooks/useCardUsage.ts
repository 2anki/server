import { useEffect, useState } from 'react';
import { getCardUsage, CardUsageResponse } from '../backend/getCardUsage';

interface CardUsageState extends CardUsageResponse {
  loading: boolean;
}

export const useCardUsage = (enabled: boolean): CardUsageState | null => {
  const [state, setState] = useState<CardUsageState | null>(null);

  useEffect(() => {
    if (!enabled) {
      setState(null);
      return;
    }
    let cancelled = false;
    setState({ cards_used: 0, cards_limit: 100, unlimited: false, loading: true });
    getCardUsage().then((result) => {
      if (cancelled || !result) return;
      setState({ ...result, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
};
