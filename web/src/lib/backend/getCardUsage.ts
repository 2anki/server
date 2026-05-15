import { get } from './api';

export interface CardUsageResponse {
  cards_used: number;
  cards_limit: number;
  unlimited: boolean;
}

export const getCardUsage = async (): Promise<CardUsageResponse | null> => {
  try {
    const data = await get('/api/users/usage');
    if (
      data &&
      typeof data.cards_used === 'number' &&
      typeof data.cards_limit === 'number' &&
      typeof data.unlimited === 'boolean'
    ) {
      return data as CardUsageResponse;
    }
    return null;
  } catch {
    return null;
  }
};
