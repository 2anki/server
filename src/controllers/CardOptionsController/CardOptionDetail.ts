export class CardOptionDetail {
  key: string;

  label: string;

  value: boolean;

  description: string;

  constructor(
    key: string,
    label: string,
    description: string,
    defaultValue: boolean
  ) {
    this.key = key;
    this.label = label;
    this.description = description;
    this.value = defaultValue;
  }
}
