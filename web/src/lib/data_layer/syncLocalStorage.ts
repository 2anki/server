import CardOption from './model/CardOption';

/**
 * Make sure the defaults are set if not present to ensure backwards compatability.
 * We are still relying on local storage for persisting user settings.
 */
export const syncLocalStorage = (options: CardOption[]) => {
  options.forEach((option: CardOption) => {
    const value = localStorage.getItem(option.key);
    if (value === null) {
      localStorage.setItem(option.key, option.value.toString());
    }
  });
};
