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
    firstId = ""
    decks = []

    for p in payload:
        deck = Deck(deck_id=p["id"], name=p["name"], description=p["desc"])
        if not firstId:
            firstId = p["id"]
        for note in p["notes"]:
            deck.add_note(note)
        decks.append(deck)

    pkg = Package(decks)
    pkg.media_files = media_files
    fout_anki = "{NAME}.apkg".format(NAME=firstId)

    pkg.write_to_file(fout_anki)
    sys.stdout.write(os.getcwd() + "/" + fout_anki)


def _read_template(template_dir, path, fmt, value):
    file_path = path if path.startswith('/')  else template_dir + path
    with open(file_path, "r", encoding="utf-8") as file:
        if fmt and value:
            return file.read().replace(fmt, value)
        else:
            return file.read()


def _build_deck_description(template_dir, image):
    return _read_template(template_dir, "deck_description.html", "%s", image)


if __name__ == "__main__":
    data_file = sys.argv[1]
    deck_style = sys.argv[2]
    template_dir = sys.argv[3]
    # TODO: error handling

    CSS = _read_template(template_dir, deck_style, "", "")
    CSS += _read_template(template_dir, "custom.css", "", "")
    CLOZE_STYLE = _read_template(template_dir, "cloze_style.css", "", "")

    MY_CLOZE_MODEL = Model(
        998877661,
        "notion2Anki Cloze Model",
        fields=[
            {"name": "Text"},
            {"name": "Extra"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "notion2Anki Cloze Card",
                "qfmt": '<span class="front-text-pre">{{cloze:Text}}</span>',
                "afmt": '<span class="front-text-pre">{{cloze:Text}}</span><br><span class="extra">{{Extra}}</span>',
            },
        ],
        css=CLOZE_STYLE + "\n" + CSS,
        model_type=Model.CLOZE,
    )

    BASIC_MODEL = Model(
        2020,
        "notion2anki",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "card1",
                "qfmt": '<span class="front-text-pre">{{Front}}</span>',
                "afmt": '<span class="front-text-post">{{Front}}</span>'
                '<hr id="answer">'
                '<span class="back-text">{{Back}}</span>',
            }
        ],
        css=CSS,
    )

    INPUT_MODEL = Model(
        6394002335189144856,
        "notion2anki-input-card",
        fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "Input"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "notion2anki-input-card",
                "qfmt": "{{Front}}" "<br>" "{{type:Input}}",
                "afmt": "{{FrontSide}}" '<hr id="answer">' "{{Back}}",
            }
        ],
        css=CSS,
    )

    with open(data_file, "r", encoding="utf-8") as json_file:
        data = json.load(json_file)
        media_files = []
        decks = []
        for deck in data:
            notes = []

            for card in deck["cards"]:
                fields = [card["name"], card["back"], ",".join(card["media"])]
                model = MY_CLOZE_MODEL

                # TODO: sanity check the card fields
                if not "{{c" in card["name"] and not "{{type" in card["name"]:
                    model = BASIC_MODEL
                elif card["enable-input"] and 'answer' in card:
                    model = INPUT_MODEL
                    fields = [
                        card["name"].replace("{{type:Input}}", ""),
                        card["back"],
                        card["answer"],
                        ",".join(card["media"]),
                    ]
                my_note = Note(model, fields=fields, sort_field=card["number"], tags=card['tags'])
                notes.append(my_note)
                media_files = media_files + card["media"]
            deck_desc = "<p>This deck is brought to you by some amazing <a class='patreon-cta' href='https://www.patreon.com/alemayhu'>patrons</a> 🤩</p>"
            cik = "image"
            if "image" in deck:
                deck_desc += _build_deck_description(template_dir, deck["image"])
            decks.append(
                {
                    "notes": notes,
                    "id": deck["id"],
                    "desc": deck_desc,
                    "name": deck["name"],
                }
            )

    _wr_apkg(decks, media_files)
