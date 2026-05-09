import { AnkiConnectCreateModelParams } from './AnkiConnectClient';

export const ANKIFY_BASIC_MODEL = 'Ankify Basic';
export const ANKIFY_CLOZE_MODEL = 'Ankify Cloze';

export const ANKIFY_BASIC_FIELDS = ['Front', 'Back'] as const;
export const ANKIFY_CLOZE_FIELDS = ['Text', 'Back Extra'] as const;

const ANKIFY_CARD_STYLING = `
html, body { text-align: center; }

.card {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica,
    "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
  color: black;
  background-color: white;
  border: lightgray 1px solid;
  padding: 16px;
  border-radius: 8px;
  margin: 16px;
  width: 80%;
  display: inline-block;
}

.card:hover {
  box-shadow: 0 0 8px #ccc;
  border: 1px solid #fff;
}

.front-text-pre { font-size: 1.5rem; }
.front-text-post { color: gray; font-size: 1rem; }
.back-text { font-size: 1.5rem; text-align: left; }
.extra { color: gray; }

hr { border: none; border-bottom: 1px solid rgba(55, 53, 47, 0.18); }

.cloze {
  font-weight: bold;
  color: #2563eb;
}
`.trim();

export const ankifyBasicCreateModelParams = (): AnkiConnectCreateModelParams => ({
  modelName: ANKIFY_BASIC_MODEL,
  inOrderFields: [...ANKIFY_BASIC_FIELDS],
  css: ANKIFY_CARD_STYLING,
  isCloze: false,
  cardTemplates: [
    {
      Name: 'Card 1',
      Front: '<span class="front-text-pre">{{Front}}</span>',
      Back: '<span class="front-text-post">{{Front}}</span><hr id="answer"><span class="back-text">{{Back}}</span>',
    },
  ],
});

export const ankifyClozeCreateModelParams = (): AnkiConnectCreateModelParams => ({
  modelName: ANKIFY_CLOZE_MODEL,
  inOrderFields: [...ANKIFY_CLOZE_FIELDS],
  css: ANKIFY_CARD_STYLING,
  isCloze: true,
  cardTemplates: [
    {
      Name: 'Cloze',
      Front: '{{cloze:Text}}',
      Back: '{{cloze:Text}}<br><span class="extra">{{Back Extra}}</span>',
    },
  ],
});
