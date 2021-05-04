export default class Settings {
  readonly deckName: string | undefined;
  readonly useInput: boolean;
  readonly maxOne: boolean;
  readonly noUnderline: boolean;
  readonly isCherry: boolean;
  readonly isAvocado: boolean;
  readonly isAll: boolean;
  readonly fontSize: string;
  readonly isTextOnlyBack: boolean;
  readonly toggleMode: string;
  readonly isCloze: boolean;
  readonly useTags: boolean;
  readonly basicReversed: boolean;
  readonly reversed: boolean;
  readonly removeMP3Links: boolean;

  readonly clozeModelName: string;
  readonly basicModelName: string;
  readonly inputModelName: string;
  readonly clozeModelId: string;
  readonly basicModelId: string;
  readonly inputModelId: string;
  readonly template: string;
  readonly perserveNewLinesInSummary: boolean;

  constructor(input: any) {
    this.deckName = input.deckName;
    this.useInput = input["enable-input"] !== "false";
    this.maxOne = input["max-one-toggle-per-card"] === "true";
    this.noUnderline = input["no-underline"] === "true";
    this.isCherry = input.cherry !== "false";
    this.isAvocado = input.avocado !== "false";
    this.isAll = input.all === "true";
    this.fontSize = input["font-size"];
    this.isTextOnlyBack = input.paragraph === "true";
    this.toggleMode = input["toggle-mode"] || "close_toggle";
    this.isCloze = input.cloze !== "false";
    this.useTags = input.tags !== "false";
    this.basicReversed = input["basic-reversed"] !== "false";
    this.reversed = input.reversed !== "false";
    this.removeMP3Links = input["remove-mp3-links"] === "true" || false;
    this.perserveNewLinesInSummary =
      input["perserve-newlines"] === "true" || false;
    this.clozeModelName = input.cloze_model_name;
    this.basicModelName = input.basic_model_name;
    this.inputModelName = input.input_model_name;
    this.clozeModelId = input.cloze_model_id;
    this.basicModelId = input.basic_model_id;
    this.inputModelId = input.input_model_id;
    this.template = input.template;
  }
}
