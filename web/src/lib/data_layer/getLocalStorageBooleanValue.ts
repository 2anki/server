import { SettingsPayload } from '../types';
import { getLocalStorageValue } from './getLocalStorageValue';

export const getLocalStorageBooleanValue = (
  key: string,
  defaultValue: string,
  theSettings: SettingsPayload
) => {
  const value = getLocalStorageValue(key, defaultValue, theSettings);
  if (value === null) {
    return defaultValue === 'true';
  }
  return value === 'true';
};
