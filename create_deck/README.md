# create_deck

This module is responsible for creating Anki flashcards for 2anki.net.

## API

The current implementation is CLI driven. [create_deck](./create_deck.py) is to
be executed with two arguments: absolute path to a JSON payload and template
directory. Note that the working directory has to be the workspace directory (
location of payload).

Here is an example execution

```bash
$ cd /tmp/w/9dOax-Y1fhrsmZxPad5g5
$ ./create_deck.py \
    /tmp/w/9dOax-Y1fhrsmZxPad5g5/deck_info.json
    /Users/scanf/src/github.com/2anki/server/src/templates/
```

Here is the workspace directory (stripped long filenames)
As you can see above there are also media files in here. The APKG file is
created based on the contents of deck_info.json.

```
/tmp/w/9dOax-Y1fhrsmZxPad5g5
├── [...].png
├── [...].apkg
├── [...].jpg
├── [...].png
├── [...].jpg
└── deck_info.json
```

### JSON Structure

Inside the deck_info.json is an array of decks.

#### Deck

The deck object consists of settings (object), name (string), cards (array),
image (string), style (string):
https://github.com/2anki/server/blob/main/src/lib/parser/Deck.ts

```typescript
class Deck {
  name: string;
  cards: Note[];
  image: string | undefined;
  style: string | null;
  id: number;
  settings: Settings | null;
}
```

#### Note

The note type here is not exactly the same as in Anki. It is a mix between
flashcards, notes and other 2anki implementation details. create_deck will use
this structure to generate the flashcards.

https://github.com/2anki/server/blob/main/src/lib/parser/Note.ts

```typescript
class Note {
  name: string;
  back: string;
  tags: string[];
  cloze = false;
  number = 0;
  enableInput = false;
  answer = '';
  media: string[] = [];
  notionId?: string;
  notionLink?: string;
}
```

#### Settings

One of the powerful things with 2anki is the flexibility it provides. With the
settings users can make new rules for what a flashcard is.

https://github.com/2anki/server/blob/main/src/lib/parser/Settings.ts

```typescript
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
}
```

## Roadmap

TODO: flesh out the details here.