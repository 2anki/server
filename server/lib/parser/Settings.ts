import { Knex } from "knex";

interface TemplateFile {
  parent: string;
  name: string;
  front: string;
  back: string;
  styling: string;
  storageKey: string;
}

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
  readonly perserveNewLines: boolean;
  readonly n2aCloze: TemplateFile | undefined;
  readonly n2aBasic: TemplateFile | undefined;
  readonly n2aInput: TemplateFile | undefined;
  readonly useNotionId: boolean;
  readonly addNotionLink: boolean;
  readonly pageEmoji: string;
  parentBlockId: string;

  constructor(input: any) {
    this.deckName = input.deckName;
    if (this.deckName && !this.deckName.trim()) {
      this.deckName = undefined;
    }
    this.useInput = input["enable-input"] !== "false";
    this.maxOne = input["max-one-toggle-per-card"] === "true";
    this.noUnderline = input["no-underline"] === "true";
    this.isCherry = input.cherry === "true";
    this.isAvocado = input.avocado === "true";
    this.isAll = input.all === "true";
    this.fontSize = input["font-size"];
    this.isTextOnlyBack = input.paragraph === "true";
    this.toggleMode = input["toggle-mode"] || "close_toggle";
    this.isCloze = input.cloze !== "false";
    this.useTags = input.tags !== "false";
    this.basicReversed = input["basic-reversed"] !== "false";
    this.reversed = input.reversed !== "false";
    this.removeMP3Links = input["remove-mp3-links"] === "true" || false;
    this.perserveNewLines =
      input["perserve-newlines"] === "true" || false;
    this.clozeModelName = input.cloze_model_name;
    this.basicModelName = input.basic_model_name;
    this.inputModelName = input.input_model_name;
    this.clozeModelId = input.cloze_model_id;
    this.basicModelId = input.basic_model_id;
    this.inputModelId = input.input_model_id;
    this.template = input.template;
    this.useNotionId = input["use-notion-id"] === "true";
    this.addNotionLink = input["add-notion-link"] === "true";
    this.parentBlockId = input.parentBlockId;
    this.pageEmoji = input["page-emoji"] || "first_emoji";
    /* Is this really needed? */
    if (this.parentBlockId) {
      this.addNotionLink = true;
    }

    if (input["n2a-basic"]) {
      try {
        this.n2aBasic = JSON.parse(input["n2a-basic"]);
      } catch (error) {
        console.error(error);
      }
    }
    if (input["n2a-cloze"]) {
      try {
        this.n2aCloze = JSON.parse(input["n2a-cloze"]);
      } catch (error) {
        console.error(error);
      }
    }
    if (input["n2a-input"]) {
      try {
        this.n2aInput = JSON.parse(input["n2a-input"]);
      } catch (error) {
        console.error(error);
      }
    }
  }

  static LoadDefaultOptions(): Object {
    return {
      "add-notion-link": "true",
      "use-notion-id": "true",
      all: "true",
      paragraph: "false",
      cherry: "false",
      avocado: "false",
      tags: "true",
      cloze: "true",
      "enable-input": "false",
      "basic-reversed": "false",
      reversed: "false",
      "no-underline": "false",
      "max-one-toggle-per-card": "true",
      "perserve-newlines": "false",
      "page-emoji": "first-emoji",
    };
  }

  static async LoadFrom(
    DB: Knex,
    owner: string,
    id: string
  ): Promise<Settings> {
    try {
      const result = await DB("settings")
        .where({ object_id: id, owner })
        .returning(["payload"])
        .first();
      if (result) {
        return new Settings(result.payload);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Failed to load settings from db ${error.toString()}`);
      }
      console.error(error);
    }
    return new Settings(Settings.LoadDefaultOptions());
  }
}
