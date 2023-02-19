import CardOption from './CardOption';

const supportedOptions = (): CardOption[] => {
  const v = [
    new CardOption(
      'add-notion-link',
      'Add Notion Link',
      'Add a link to the Notion page where the toggle was created. Please this with the (Use Notion ID) to avoid duplicates.',
      true
    ),
    new CardOption(
      'use-notion-id',
      'Use Notion ID',
      'By default we create a new id from your fields. This can cause duplicates and in those cases you want to enable the Notion ID which is more reliable and avoid duplicates.',
      true
    ),
    new CardOption(
      'all',
      'Use All Toggle Lists',
      'By default we only check for toggle lists in the first page. Use this option to retreive toggle lists from anywhere in the page.',
      true
    ),
    new CardOption(
      'paragraph',
      'Use Plain Text for Back',
      'This option will remove formatting and get the text content only.',
      false
    ),
    new CardOption(
      'cherry',
      'Enable Cherry Picking Using 🍒 Emoji',
      'This will Only create flashcards from the toggle lists that include 🍒 in the toggle (header or body)',
      false
    ),
    new CardOption(
      'avocado',
      "Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji",
      "This option enables you to ignore certain toggles when creating flashcards from pages that you don't want to change too much.",
      false
    ),
    new CardOption(
      'tags',
      'Treat Strikethrough as Tags',
      'This will go treat the strikethroughs in the page as global ones. The ones inside of a toggle will be treated as locally to the toggle.',
      false
    ),
    new CardOption(
      'cloze',
      'Cloze Deletion',
      'Create cloze flashcards from code blocks.',
      true
    ),
    new CardOption(
      'enable-input',
      'Treat Bold Text as Input',
      'Words marked as bold will be removed and you will have to enter them in when reviewing the card. This is useful when you need to type out the answer.',
      false
    ),
    new CardOption(
      'basic-reversed',
      'Basic and Reversed',
      'Create the question and answer flashcards but also reversed ones. Where the answer and question change places.',
      false
    ),
    new CardOption(
      'reversed',
      'Just the Reversed Flashcards',
      'Only create flashcards from the reverse. This is useful when you want to say show an image first.',
      false
    ),
    new CardOption(
      'no-underline',
      'Remove Underlines',
      'Disable underline. This is an option that was created due to changes in the way Notion handles underlines.',
      false
    ),
    new CardOption(
      'max-one-toggle-per-card',
      'Maximum One Toggle Per Card',
      "This will limit to 1 card so you don't see too many toggles in one card. When you combine this with 'Use all toggle lists' you can create flashcards from everything in your upload, regardless of how deeply nested they are.",
      true
    ),
    new CardOption(
      'remove-mp3-links',
      'Remove the MP3 Links Created From Audio Files',
      "Due to backwards-compatability we leave links untouched but this option let's you remove mp3 links",
      true
    ),
    new CardOption(
      'perserve-newlines',
      'Preserve Newlines in the Toggle Header and Body',
      'This will allow you to use SHIFT-Enter in the toggles to create multiple lines for all card types (Basic, Cloze, etc.)',
      true
    ),
  ];

  return v.filter(Boolean);
};

export default supportedOptions;
