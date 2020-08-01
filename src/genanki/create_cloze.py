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

def _wr_apkg(notes, deck_id, deck_name, media_files):
  """Write cloze cards to an Anki apkg file"""
  deck = Deck(deck_id=deck_id, name=deck_name)
  for note in notes:
    deck.add_note(note)
  fout_anki = '{NAME}.apkg'.format(NAME=deck_name)
  pkg = Package(deck)
  pkg.media_files = media_files
  pkg.write_to_file(fout_anki)
  sys.stdout.write(os.getcwd()+'/'+fout_anki)

if __name__ == '__main__':
  # print(sys.argv)
  data_file = sys.argv[1]
  deck_name = sys.argv[2]
  deck_id = int(sys.argv[3])
  deck_style = sys.argv[4]
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
    font-weight: bold;
    color: blue;
  }
  
  .nightMode .cloze {
    color: lightblue;
  }
  """

  with open(deck_style, 'r') as file:
    CSS += file.read()

  MY_CLOZE_MODEL = Model(
  998877661,
  'Notion2Anki Cloze Model',
  fields=[
    {'name': 'Text'},
    {'name': 'Extra'},
    {'name': 'MyMedia'},
  ],
  templates=[{
    'name': 'Notion2Anki Cloze Card',
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

  with open(data_file) as json_file:
    data = json.load(json_file)
    for card in data['cards']:
      fields = [card['name'], card['back'], ",".join(card['media'])]
      model = MY_CLOZE_MODEL
      if not "{{c" in card['name']:
        model = BASIC_MODEL
      my_cloze_note = Note(model, fields=fields)
      notes.append(my_cloze_note)

  _wr_apkg(notes, deck_id, deck_name, data['media'])