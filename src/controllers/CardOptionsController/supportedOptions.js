"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CardOptionDetail_1 = require("./CardOptionDetail");
const supportedOptions = () => {
    const v = [
        new CardOptionDetail_1.CardOptionDetail('add-notion-link', 'Add Notion Link', 'Add a link to the Notion page where the toggle was created. Please use this with the (Use Notion ID) to avoid duplicates.', false),
        new CardOptionDetail_1.CardOptionDetail('use-notion-id', 'Use Notion ID', 'By default we create a new id from your fields. This can cause duplicates and in those cases you want to enable the Notion ID which is more reliable and avoid duplicates.', true),
        new CardOptionDetail_1.CardOptionDetail('all', 'Use All Toggle Lists', 'By default we only check for toggle lists in the first page. Use this option to retreive toggle lists from anywhere in the page.', true),
        new CardOptionDetail_1.CardOptionDetail('paragraph', 'Use Plain Text for Back', 'This option will remove formatting and get the text content only.', false),
        new CardOptionDetail_1.CardOptionDetail('cherry', 'Enable Cherry Picking Using 🍒 Emoji', 'This will Only create flashcards from the toggle lists that include 🍒 in the toggle (header or body)', false),
        new CardOptionDetail_1.CardOptionDetail('avocado', "Only Create Flashcards From Toggles That Don't Have The 🥑 Emoji", "This option enables you to ignore certain toggles when creating flashcards from pages that you don't want to change too much.", false),
        new CardOptionDetail_1.CardOptionDetail('tags', 'Treat Strikethrough as Tags', 'This will go treat the strikethroughs in the page as global ones. The ones inside of a toggle will be treated as locally to the toggle.', false),
        new CardOptionDetail_1.CardOptionDetail('cloze', 'Cloze Deletion', 'Create cloze flashcards from code blocks.', true),
        new CardOptionDetail_1.CardOptionDetail('enable-input', 'Treat Bold Text as Input', 'Words marked as bold will be removed and you will have to enter them in when reviewing the card. This is useful when you need to type out the answer.', false),
        new CardOptionDetail_1.CardOptionDetail('basic-reversed', 'Basic and Reversed', 'Create the question and answer flashcards but also reversed ones. Where the answer and question change places.', false),
        new CardOptionDetail_1.CardOptionDetail('reversed', 'Just the Reversed Flashcards', 'Only create flashcards from the reverse. This is useful when you want to say show an image first.', false),
        new CardOptionDetail_1.CardOptionDetail('no-underline', 'Remove Underlines', 'Disable underline. This is an option that was created due to changes in the way Notion handles underlines.', false),
        new CardOptionDetail_1.CardOptionDetail('max-one-toggle-per-card', 'Maximum One Toggle Per Card', "This will limit to 1 card so you don't see too many toggles in one card. When you combine this with 'Use all toggle lists' you can create flashcards from everything in your upload, regardless of how deeply nested they are.", true),
        new CardOptionDetail_1.CardOptionDetail('remove-mp3-links', 'Remove the MP3 Links Created From Audio Files', "Due to backwards-compatability we leave links untouched but this option let's you remove mp3 links", true),
        new CardOptionDetail_1.CardOptionDetail('perserve-newlines', 'Preserve Newlines in the Toggle Header and Body', 'This will allow you to use SHIFT-Enter in the toggles to create multiple lines for all card types (Basic, Cloze, etc.)', true),
        new CardOptionDetail_1.CardOptionDetail('process-pdfs', 'Process PDF Files', 'When enabled, PDF files in ZIP uploads will be processed and converted to Anki cards. Disable this to skip PDF processing and speed up conversion of ZIP files containing PDFs.', true),
        new CardOptionDetail_1.CardOptionDetail('markdown-nested-bullet-points', 'Markdown Nested Bullet Points', 'Enable conversion of bullet and sub bullet points in Markdown. If you are a Obsidian user, enable this', true),
        new CardOptionDetail_1.CardOptionDetail('vertex-ai-pdf-questions', 'Generate Questions from Single PDF File Uploads', 'Use Vertex AI API to generate questions from PDFs. This is a paid feature and if enabled will send your notes to Google Cloud.', false),
        new CardOptionDetail_1.CardOptionDetail('disable-indented-bullets', 'Disable Indented Bullets', 'Disable indented bullets from becoming separate cards. This applies to bullet lists.', false),
        new CardOptionDetail_1.CardOptionDetail('image-quiz-html-to-anki', 'Convert Image Quiz HTML to Anki Cards', 'Use OCR to extract images and answers from HTML quizzes and convert them into Anki flashcards for review. This is a premium experimental feature.', false),
        new CardOptionDetail_1.CardOptionDetail('disable-embedding-images', 'Disable Embedding Images', 'When enabled, remote images will not be downloaded and embedded into Anki media. Instead, they remain referenced by their remote URLs. Useful for users who are online most of the time and prefer smaller Anki package sizes.', false),
    ];
    return v.filter(Boolean);
};
exports.default = supportedOptions;
//# sourceMappingURL=supportedOptions.js.map