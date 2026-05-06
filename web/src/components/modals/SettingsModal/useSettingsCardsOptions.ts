import { useQuery } from '@tanstack/react-query';
import { getSettingsCardOptions } from '../../../lib/backend/getSettingsCardOptions';
import CardOption from '../../../lib/data_layer/model/CardOption';
import { FIFTEEN_MINUTES } from './constants';

export const useSettingsCardsOptions = (pageId: string | null) => {
  const {
    isLoading,
    isError,
    data: options,
    error: loadingDefaultsError,
  } = useQuery<CardOption[]>({
    queryKey: [`cardOptions-${pageId ?? 'default'}`], // pageId will invalidate the cache
    queryFn: getSettingsCardOptions,
    staleTime: FIFTEEN_MINUTES,
  });

  return { isLoading, isError, options, loadingDefaultsError };
};
