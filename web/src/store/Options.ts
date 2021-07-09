interface CardOption {
  key: string;
  label: string;
  value: boolean;
  description: string;
}

const _loadOption = (key: string, defaultValue: boolean) => {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }
  return value === "true";
};

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
        key: "add-notion-link",
        label: "Add Notion Link",
        value: _loadOption("add-notion-link", false),
        description:
          "Add a link to the Notion page where the toggle was created. Please this with the (Use Notion ID) to avoid duplicates.",
      },
      {
        key: "use-notion-id",
        label: "Use Notion ID",
        value: _loadOption("use-notion-id", false),
        description:
          "By default we create a new id from your fields. This can cause duplicates and in those cases you want to enable the Notion ID which is more reliable and avoid duplicates.",
      },
      {
        key: "all",
        label: "Use All Toggle Lists",
        value: _loadOption("all", false),
        description:
          "By default we only check for toggle lists in the first page. Use this option to retreive toggle lists from anywhere in the page.",
      },
      {
        key: "paragraph",
        label: "Use Plain Text for Back",
        value: _loadOption("paragraph", false),
        description:
          "This option will remove formatting and get the text content only.",
      },
      {
        key: "cherry",
        label: "Enable Cherry Picking Using 🍒 Emoji",
        value: _loadOption("cherry", false),
        description:
          "This will Only create flashcards from the toggle lists that include 🍒 in the toggle (header or body)",
      },
      {
        key: "avocado",
        label:
          "Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji",
        value: _loadOption("avocado", false),
        description:
          "This option enables you to ignore certain toggles when creating flashcards from pages that you don't want to change too much.",
      },
      {
        key: "tags",
        label: "Treat Strikethrough as Tags",
        value: _loadOption("tags", true),
        description:
          "This will go treat the strikethroughs in the page as global ones. The ones inside of a toggle will be treated as locally to the toggle.",
      },
      {
        key: "cloze",
        label: "Cloze Deletion",
        value: _loadOption("cloze", true),
        description: "Create cloze flashcards from code blocks.",
      },
      {
        key: "enable-input",
        label: "Treat Bold Text as Input",
        value: _loadOption("enable-input", false),
        description:
          "Words marked as bold will be removed and you will have to enter them in when reviewing the card. This is useful when you need to type out the answer.",
      },
      {
        key: "basic-reversed",
        label: "Basic and Reversed",
        value: _loadOption("basic-reversed", false),
        description:
          "Create the question and answer flashcards but also reversed ones. Where the answer and question change places.",
      },
      {
        key: "reversed",
        label: "Just the Reversed Flashcards",
        value: _loadOption("reversed", false),
        description:
          "Only create flashcards from the reverse. This is useful when you want to say show an image first.",
      },
      {
        key: "no-underline",
        label: "Remove Underlines",
        value: _loadOption("no-underline", false),
        description:
          "Disable underline. This is an option that was created due to changes in the way Notion handles underlines.",
      },
      {
        key: "max-one-toggle-per-card",
        label: "Maximum One Toggle Per Card",
        value: _loadOption("max-one-toggle-per-card", false),
        description:
          "This will limit to 1 card so you don't see too many toggles in one card. When you combine this with 'Use all toggle lists' you can create flashcards from everything in your upload, regardless of how deeply nested they are.",
      },
      {
        key: "remove-mp3-links",
        label: "Remove the MP3 Links Created From Audio Files",
        value: _loadOption("remove-mp3-links", false),
        description:
          "Due to backwards-compatability we leave links untouched but this option let's you remove mp3 links",
      },
      {
        key: "perserve-newlines",
        label: "Preserve Newlines in the Toggle Header and Body",
        value: _loadOption("perserve-newlines", false),
        description:
          "This will allow you to use SHIFT-Enter in the toggles to create multiple lines for all card types (Basic, Cloze, etc.)",
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
