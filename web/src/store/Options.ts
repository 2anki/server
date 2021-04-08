interface CardOption {
  key: string;
  label: string;
  default: boolean;
  description: string;
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
        label: "Use All Toggle Lists",
        default: localStorage.getItem("all") === "true" || false,
        description:
          "By default we only check for toggle lists in the first page. Use this option to retreive toggle lists from anywhere in the page.",
      },
      {
        key: "paragraph",
        label: "Use Plain Text for Back",
        default: localStorage.getItem("paragraph") === "true" || false,
        description:
          "This option will remove formatting and get the text content only.",
      },
      {
        key: "cherry",
        label: "Enable Cherry Picking Using 🍒 Emoji",
        default: localStorage.getItem("cherry") === "true" || false,
        description:
          "This will Only create flashcards from the toggle lists that include 🍒 in the toggle (header or body)",
      },
      {
        key: "avocado",
        label:
          "Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji",
        default: localStorage.getItem("avocado") === "true" || false,
        description:
          "This option enables you to ignore certain toggles when creating flashcards from pages that you don't want to change too much.",
      },
      {
        key: "tags",
        label: "Treat Strikethrough as Tags",
        default: localStorage.getItem("tags") === "true" || true,
        description:
          "This will go treat the strikethroughs in the page as global ones. The ones inside of a toggle will be treated as locally to the toggle.",
      },
      {
        key: "basic",
        label: "Basic Front and Back",
        default: localStorage.getItem("basic") === "true" || true,
        description:
          "Create question and answer type flashcards. This is the default unless turned off.",
      },
      {
        key: "cloze",
        label: "Cloze Deletion",
        default: localStorage.getItem("cloze") === "true" || true,
        description: "Create cloze flashcards from code blocks.",
      },
      {
        key: "enable-input",
        label: "Treat Bold Text as Input",
        default: localStorage.getItem("enable-input") === "true" || false,
        description:
          "Words marked as bold will be removed and you will have to enter them in when reviewing the card. This is useful when you need to type out the answer.",
      },
      {
        key: "basic-reversed",
        label: "Basic and Reversed",
        default: localStorage.getItem("basic-reversed") === "true" || false,
        description:
          "Create the question and answer flashcards but also reversed ones. Where the answer and question change places.",
      },
      {
        key: "reversed",
        label: "Just the Reversed Flashcards",
        default: localStorage.getItem("reversed") === "true" || false,
        description:
          "Only create flashcards from the reverse. This is useful when you want to say show an image first.",
      },
      {
        key: "no-underline",
        label: "Remove Underlines",
        default: localStorage.getItem("no-underline") === "true" || false,
        description:
          "Disable underline. This is an option that was created due to changes in the way Notion handles underlines.",
      },
      {
        key: "max-one-toggle-per-card",
        label: "Maximum One Toggle Per Card",
        default:
          localStorage.getItem("max-one-toggle-per-card") === "true" || false,
        description:
          "This will limit to 1 card so you don't see too many toggles in one card. When you combine this with 'Use all toggle lists' you can create flashcards from everything in your upload, regardless of how deeply nested they are.",
      },
      {
        key: "remove-mp3-links",
        label: "Remove the MP3 Links Created From Audio Files",
        default: localStorage.getItem("remove-mp3-links") === "true" || false,
        description:
          "Due to backwards-compatability we leave links untouched but this option let's you remove mp3 links",
      },
    ];
  }

  clear() {
    localStorage.clear();
    this.options = this.configure();
    this.loadDefaults();
  }

  loadDefaults() {
    for (const option of this.options) {
      const value = localStorage.getItem(option.key);
      if (value === null) {
        localStorage.setItem(option.key, option.default.toString());
      }
    }
  }
}

export default CardOptionsStore;
