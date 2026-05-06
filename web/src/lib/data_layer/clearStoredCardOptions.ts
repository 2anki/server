import CardOption from './model/CardOption';

export const clearStoredCardOptions = (options: CardOption[]) => {
  /**
   * Delete the known options, the app might be storing other things we want.
   */
  for (let i = 0; i < options.length; i += 1) {
    const option = options[i];
    localStorage.removeItem(option.key);
  }
};
