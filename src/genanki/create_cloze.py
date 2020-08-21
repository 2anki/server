"""
This file is a modifcation on one of the test files of genanki[0]
[0]: https://github.com/kerrickstaley/genanki
"""
"""Test creating Cloze cards"""
# https://apps.ankiweb.net/docs/manual20.html#cloze-deletion

import uuid
import json
import sys
import os

from genanki import Model
from genanki import Note
from genanki import Deck
from genanki import Package
from genanki import guid_for

DESC = """
<p>This deck was made with <a href="https://2anki.net/notion">notion2Anki</a>.
<strong>notion2Anki</strong> is 100% 🆓 and open source with no limitations on file size. It's a passion project 🕺🏾💃🏾</p>

<p>Brought to you by our amazing <a href="https://www.patreon.com/alemayhu">patrons</a>.
We the hopes that it will help you in making Anki flashcards easier, better and faster
for anyone anywhere around the world 🌎</p>

<p>If you can afford it please support us on <a href="https://www.patreon.com/alemayhu">Patreon</a>
and get exlusive access to private calls with us 🤙🏾 get motivated to challenge your limits ✨
Checkout more on <a href="https://www.patreon.com/alemayhu">Patreon</a></p>

<p>Don't like Patreon or want use Paypal? No worries, find other methods to support us on <a href="https://donate.alemayhu.com">donate.alemayhu.com</a>.</p>
"""

def _wr_apkg(notes, deck_id, deck_name, media_files):
  """Write cloze cards to an Anki apkg file"""
  deck = Deck(deck_id=deck_id, name=deck_name, description=DESC)
  for note in notes:
    deck.add_note(note)

  fout_anki = '{NAME}.apkg'.format(NAME=deck_id)
  pkg = Package(deck)
  pkg.media_files = media_files
  pkg.write_to_file(fout_anki)
  sys.stdout.write(os.getcwd()+'/'+fout_anki)

if __name__ == '__main__':
  data_file = sys.argv[1]
  deck_id = int(sys.argv[2])
  deck_style = sys.argv[3]
  deck_name = ''
  # TODO: error handling

  CSS = ""
  CLOZE_STYLE = """
  .card {
    font-family: arial;
    font-size: 20px;
    text-align: center;
    color: black;
    background-color: white;
  }

  .cloze {
    background: rgba(135,131,120,0.15);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-weight: bold;
    color: blue;
  }

  .nightMode .cloze {
    color: lightblue;
  }
  """

  with open(deck_style, 'r', encoding='utf-8') as file:
    CSS += file.read()

  MY_CLOZE_MODEL = Model(
  998877661,
  'notion2Anki Cloze Model',
  fields=[
    {'name': 'Text'},
    {'name': 'Extra'},
    {'name': 'MyMedia'},
  ],
  templates=[{
    'name': 'notion2Anki Cloze Card',
    'qfmt': '{{cloze:Text}}',
    'afmt': '{{cloze:Text}}<br>{{Extra}}',
  },],
  css=CLOZE_STYLE+'\n'+CSS,
  model_type=Model.CLOZE)

  BASIC_MODEL = Model(
    2020, 'notion2anki',
    fields=[
      { 'name': 'AField' },
      { 'name': 'BField' },
      { 'name': 'MyMedia' },
    ],
    templates=[
      {
        'name': 'card1',
        'qfmt': '{{AField}}',
        'afmt': '{{FrontSide}}'
                '<hr id="answer">'
                '{{BField}}',
      }
    ],
    css=CSS
  )  

  notes = []

  with open(data_file, 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)
    deck_name = data['name']
    for card in data['cards']:
      fields = [card['name'], card['back'], ",".join(card['media'])]
      model = MY_CLOZE_MODEL
      if not "{{c" in card['name']:
        model = BASIC_MODEL
      my_cloze_note = Note(model, fields=fields)
      notes.append(my_cloze_note)

  _wr_apkg(notes, deck_id, deck_name, data['media'])
