/**
 * Loads the option from local storage
 * @param key the key of the option in the local storage
 * @param defaultValue if the option is not found in the local storage, this value will be used
 * @returns whether the option is enabled or not
 */
function loadOption(key: string, defaultValue: boolean): boolean {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }
  return value === 'true';
}
class CardOption {
  key: string;

  label: string;

  value: boolean;

  description: string;

  constructor(
    key: string,
    label: string,
    description: string,
    defaultValue = false
  ) {
    this.key = key;
    this.label = label;
    this.description = description;
    this.value = loadOption(key, defaultValue);
  }
}

export default CardOption;
