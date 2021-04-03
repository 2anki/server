interface CardOption {
  key: string;
  label: string;
  default: boolean;
}

class CardOptionsStore {
  public options: CardOption[];

  constructor() {
    this.options = this.configure();
  }

  configure() {
    return [
      {
        key: "all",
        label: "Use all toggle lists",
        default: localStorage.getItem("all") === "true" || false,
      },
      {
        key: "paragraph",
        label: "Use plain text for back",
        default: localStorage.getItem("paragraph") === "true" || false,
      },
      {
        key: "cherry",
        label: "Enable cherry picking using 🍒 emoji",
        default: localStorage.getItem("cherry") === "true" || false,
      },
      {
        key: "avocado",
        label:
          "Only create flashcards from toggles that don't have the 🥑 emoji",
        default: localStorage.getItem("avocado") === "true" || false,
      },
      {
        key: "tags",
        label: "Treat strikethrough as tags",
        default: localStorage.getItem("tags") === "true" || true,
      },
      {
        key: "basic",
        label: "Basic front and back",
        default: localStorage.getItem("basic") === "true" || true,
      },
      {
        key: "cloze",
        label: "Cloze deletion",
        default: localStorage.getItem("cloze") === "true" || true,
      },
      {
        key: "enable-input",
        label: "Treat bold text as input",
        default: localStorage.getItem("enable-input") === "true" || false,
      },
      {
        key: "basic-reversed",
        label: "Basic and reversed",
        default: localStorage.getItem("basic-reversed") === "true" || false,
      },
      {
        key: "reversed",
        label: "Just the reversed",
        default: localStorage.getItem("reversed") === "true" || false,
      },
      {
        key: "no-underline",
        label: "Remove underlines",
        default: localStorage.getItem("no-underline") === "true" || false,
      },
      {
        key: "max-one-toggle-per-card",
        label: "Maximum one toggle per card",
        default:
          localStorage.getItem("max-one-toggle-per-card") === "true" || false,
      },
      {
        key: "remove-mp3-links",
        label: "Remove the mp3 links created from Audio files",
        default: localStorage.getItem("remove-mp3-links") === "true" || false,
      },
    ];
  }

  clear() {
    localStorage.clear();
    this.options = this.configure();
  }
}

export default CardOptionsStore;
