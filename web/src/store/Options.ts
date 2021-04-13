interface CardOption {
  key: string;
  label: string;
  value: boolean;
  description: string;
}

class CardOptionsStore {
  public options: CardOption[];

  constructor() {
    this.options = this.configure();
  }

  public get(key: string): CardOption | undefined {
    return this.options.find((o) => o.key === key);
  }

  public update(key: string, value: boolean) {
    const newOptions = this.options.map((o) => {
      if (o.key === key) {
        return { ...o, value: value };
      }
      return o;
    });
    localStorage.setItem(key, value.toString());
    this.options = newOptions;
  }

  configure() {
    return [
      {
        key: "all",
        label: "Use All Toggle Lists",
        value: localStorage.getItem("all") === "true" || false,
        description:
          "By default we only check for toggle lists in the first page. Use this option to retreive toggle lists from anywhere in the page.",
      },
      {
        key: "paragraph",
        label: "Use Plain Text for Back",
        value: localStorage.getItem("paragraph") === "true" || false,
        description:
          "This option will remove formatting and get the text content only.",
      },
      {
        key: "cherry",
        label: "Enable Cherry Picking Using 🍒 Emoji",
        value: localStorage.getItem("cherry") === "true" || false,
        description:
          "This will Only create flashcards from the toggle lists that include 🍒 in the toggle (header or body)",
      },
      {
        key: "avocado",
        label:
          "Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji",
        value: localStorage.getItem("avocado") === "true" || false,
        description:
          "This option enables you to ignore certain toggles when creating flashcards from pages that you don't want to change too much.",
      },
      {
        key: "tags",
        label: "Treat Strikethrough as Tags",
        value: localStorage.getItem("tags") === "true" || true,
        description:
          "This will go treat the strikethroughs in the page as global ones. The ones inside of a toggle will be treated as locally to the toggle.",
      },
      {
        key: "basic",
        label: "Basic Front and Back",
        value: localStorage.getItem("basic") === "true" || true,
        description:
          "Create question and answer type flashcards. This is the default unless turned off.",
      },
      {
        key: "cloze",
        label: "Cloze Deletion",
        value: localStorage.getItem("cloze") === "true" || true,
        description: "Create cloze flashcards from code blocks.",
      },
      {
        key: "enable-input",
        label: "Treat Bold Text as Input",
        value: localStorage.getItem("enable-input") === "true" || false,
        description:
          "Words marked as bold will be removed and you will have to enter them in when reviewing the card. This is useful when you need to type out the answer.",
      },
      {
        key: "basic-reversed",
        label: "Basic and Reversed",
        value: localStorage.getItem("basic-reversed") === "true" || false,
        description:
          "Create the question and answer flashcards but also reversed ones. Where the answer and question change places.",
      },
      {
        key: "reversed",
        label: "Just the Reversed Flashcards",
        value: localStorage.getItem("reversed") === "true" || false,
        description:
          "Only create flashcards from the reverse. This is useful when you want to say show an image first.",
      },
      {
        key: "no-underline",
        label: "Remove Underlines",
        value: localStorage.getItem("no-underline") === "true" || false,
        description:
          "Disable underline. This is an option that was created due to changes in the way Notion handles underlines.",
      },
      {
        key: "max-one-toggle-per-card",
        label: "Maximum One Toggle Per Card",
        value:
          localStorage.getItem("max-one-toggle-per-card") === "true" || false,
        description:
          "This will limit to 1 card so you don't see too many toggles in one card. When you combine this with 'Use all toggle lists' you can create flashcards from everything in your upload, regardless of how deeply nested they are.",
      },
      {
        key: "remove-mp3-links",
        label: "Remove the MP3 Links Created From Audio Files",
        value: localStorage.getItem("remove-mp3-links") === "true" || false,
        description:
          "Due to backwards-compatability we leave links untouched but this option let's you remove mp3 links",
      },
      {
        key: "keep-header-formatting",
        label: "Allow List Formatting in Toggle Header",
        value:
          localStorage.getItem("keep-header-formatting") === "true" || false,
        description:
          "This will allow you to use SHIFT-Enter in the toggle header to create multiple lines",
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
        localStorage.setItem(option.key, option.value.toString());
      }
    }
  }
}

export default CardOptionsStore;
