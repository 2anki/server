import CardOption from '../data_layer/model/CardOption';
import { get } from './api';
import { get2ankiApi } from './get2ankiApi';
import { syncLocalStorage } from '../data_layer/syncLocalStorage';

export const getSettingsCardOptions = async (): Promise<CardOption[]> => {
  const options = await get(`${get2ankiApi().baseURL}settings/card-options`);
  const loadDefaults = localStorage.getItem('skip-defaults') !== 'true';
  if (loadDefaults) {
    syncLocalStorage(options);
  }
  return options;
};
