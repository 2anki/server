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

def _wr_apkg(payload, media_files):
  """Write cloze cards to an Anki apkg file"""
  decks = []
  firstId = ''
  for p in payload:
    deck = Deck(deck_id=p['id'], name=p['name'], description=p['desc'])
    if not firstId:
      firstId = p['id']
    for note in p['notes']:
      deck.add_note(note)
    decks.append(deck)

  pkg = Package(decks)
  pkg.media_files = media_files
  fout_anki = '{NAME}.apkg'.format(NAME=firstId)

  pkg.write_to_file(fout_anki)
  sys.stdout.write(os.getcwd()+'/'+fout_anki)

def _build_deck_description(image):
        return """
          <style>
          html {
            width: 100vw;
            height: 100vh;
          }
          body {
              background: url(%s) no-repeat;
              background-size: cover;
              color: white;
          }
          center {
              background: linear-gradient(45deg, black, transparent);
              mix-blend-mode: difference;
              border-radius: 0.2rem;
              padding: 1rem;
          }          
          p {
            color: white;
          }
          p:first-of-type {
              text-align: center;
          }
          .review-count,
          .learn-count,
          .new-count {
              padding: 0.1rem 0.3rem;
              background: white;
              border-radius: 0.3rem;
          }

          .patreon-cta {
              text-decoration: none;
              color: white;
              background: tomato;
              padding: 0.1rem 0.3rem;
              border-radius: 0.3rem;
              text-align: center;   
          }
          </style>
        """ % (image)

if __name__ == '__main__':
  data_file = sys.argv[1]
  deck_style = sys.argv[2]
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

  INPUT_MODEL = Model(
    6394002335189144856, 'notion2anki-input-card',
    fields=[
      { 'name': 'Front' },
      { 'name': 'Back' },
      { 'name': 'Input' },
      { 'name': 'MyMedia' },
    ],
    templates=[
      {
        'name': 'notion2anki-input-card',
        'qfmt': '{{Front}}'
                '<br>'
                '{{type:Input}}',
        'afmt': '{{FrontSide}}'
                '<hr id="answer">'
                '{{Back}}',
      }
    ],
    css=CSS
  )

  with open(data_file, 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)
    media_files = []
    decks = []
    for deck in data:
      notes = []
    
      for card in deck['cards']:
        fields = [card['name'], card['back'], ",".join(card['media'])]
        model = MY_CLOZE_MODEL

        # TODO: sanity check the card fields
        if not "{{c" in card['name'] and not "{{type" in card['name']:
          model = BASIC_MODEL
        elif deck['card_type'] == 'enable-input':
          model = INPUT_MODEL
          fields = [card['name'].replace('{{type:Input}}', ''), card['back'], card['answer'], ",".join(card['media'])]
        my_note = Note(model, fields=fields, sort_field=card['number'], tags=card['tags'])
        notes.append(my_note)
        media_files = media_files + card['media']
      deck_desc = "<p>This deck is brought to you by some amazing <a class='patreon-cta' href='https://www.patreon.com/alemayhu'>patrons</a> 🤩</p>"
      cik = 'image'
      if 'image' in deck:
        deck_desc += _build_deck_description(deck['image'])
      decks.append({"notes": notes, "id": deck['id'], "desc": deck_desc, "name": deck['name']})

  _wr_apkg(decks, media_files)
