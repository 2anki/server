import CardOption from './model/CardOption';

export const clearStoredCardOptions = (options: CardOption[]) => {
  /**
   * Delete the known options, the app might be storing other things we want.
   */
  for (const option of options) {
    localStorage.removeItem(option.key);
  }
};
