import supportedOptions from './supportedOptions';
import CardOption from './CardOption';

class CardOptionsStore {
  public options: CardOption[];

  constructor(loadDefaults: boolean) {
    this.options = supportedOptions();
    if (loadDefaults) {
      this.syncLocalStorage();
    }
  }

  public get(key: string): CardOption | undefined {
    return this.options.find((o) => o.key === key);
  }

  public update(key: string, value: boolean) {
    const newOptions = this.options.map((o) => {
      if (o.key === key) {
        return { ...o, value };
      }
      return o;
    });
    localStorage.setItem(key, value.toString());
    this.options = newOptions;
  }

  clear() {
    /**
     * Delete the known options, the app might be storing other things we want.
     */
    supportedOptions().forEach((option: CardOption) => {
      localStorage.removeItem(option.key);
    });
    this.options = supportedOptions();
    this.syncLocalStorage();
  }

  syncLocalStorage() {
    this.options.forEach((option: CardOption) => {
      const value = localStorage.getItem(option.key);
      if (value === null) {
        localStorage.setItem(option.key, option.value.toString());
      }
    });
  }
}

export default CardOptionsStore;
