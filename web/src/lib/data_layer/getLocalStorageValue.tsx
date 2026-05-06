import { SettingsPayload } from '../types';

export const getLocalStorageValue = (
  key: string,
  defaultValue: string,
  theSettings: SettingsPayload
) => {
  if (theSettings && key in theSettings) {
    return theSettings[key] || defaultValue;
  }
  return localStorage.getItem(key) || defaultValue;
};
