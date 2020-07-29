"""Test creating Cloze cards"""
# https://apps.ankiweb.net/docs/manual20.html#cloze-deletion

import sys
from genanki import Model
from genanki import Note
from genanki import Deck
from genanki import Package

import uuid
import json

CSS = """.card {
 font-family: arial;
 font-size: 20px;
 text-align: center;
 color: black;
 background-color: white;
}

.cloze {
 font-weight: bold;
 color: blue;
}
.nightMode .cloze {
 color: lightblue;
}
"""

MY_CLOZE_MODEL = Model(
  998877661,
  'Notion2Anki Cloze Model',
  fields=[
    {'name': 'Text'},
    {'name': 'Extra'},
  ],
  templates=[{
    'name': 'Notion2Anki Cloze Card',
    'qfmt': '{{cloze:Text}}',
    'afmt': '{{cloze:Text}}<br>{{Extra}}',
  },],
  css=CSS,
  model_type=Model.CLOZE)

def _wr_apkg(notes, deck_id, deck_name):
  """Write cloze cards to an Anki apkg file"""
  deck = Deck(deck_id=deck_id, name=deck_name)
  for note in notes:
    deck.add_note(note)
  fout_anki = '{NAME}.apkg'.format(NAME=deck_name)
  Package(deck).write_to_file(fout_anki)
  print(fout_anki, end='')


if __name__ == '__main__':
  # print(sys.argv)
  data_file = sys.argv[1]
  deck_name = sys.argv[2]
  deck_id = int(sys.argv[3])
  notes = []

  with open(data_file) as json_file:
    data = json.load(json_file)
    for card in data['cards']:
      fields = [card['name'], card['back']]
      my_cloze_note = Note(model=MY_CLOZE_MODEL, fields=fields)
      notes.append(my_cloze_note)

  _wr_apkg(notes, deck_id, deck_name)