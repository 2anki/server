"""
This file is a modifcation on one of the test files of genanki[0].
It's used to create the APKG file from the JSON structure produced
by the Notion to Anki parser.

[0]: https://github.com/kerrickstaley/genanki
"""

import hashlib
import json
import sys

from genanki import Note

from models.input import input_model
from models.cloze import cloze_model
from models.basic import basic_model

from fs_util import _read_template, _build_deck_description, _wr_apkg

# TODO: is this really safe
# Perserve the old ids for backwards compatability
def model_id(name):
    if name == "n2a-input":
        return 6394002335189144856
    elif name == "n2a-cloze":
        return 998877661
    elif name == "n2a-basic":
        return 2020
    # https://stackoverflow.com/questions/16008670/how-to-hash-a-string-into-8-digits
    return abs(int(hashlib.sha1(name.encode("utf-8")).hexdigest(), 16) % (10 ** 8))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise IOError('missing payload arguments(data file, deck style, template dir)')
    data_file = sys.argv[1]
    deck_style = sys.argv[2]
    template_dir = sys.argv[3]

    CSS = _read_template(template_dir, deck_style, "", "")
    CLOZE_STYLE = _read_template(template_dir, "cloze_style.css", "", "")

    with open(data_file, "r", encoding="utf-8") as json_file:
        data = json.load(json_file)
        media_files = []
        decks = []

        # Model / Template stuff
        mt = data[0]["settings"]

        # Retreive template names for user or get the default ones
        cloze_model_name = mt.get('clozeModelName', "n2a-cloze")
        basic_model_name = mt.get('basicModelName', "n2a-basic")
        input_model_name = mt.get('inputModelName', "n2a-input")

        # Set the model ids based on the template name
        input_model_id = mt.get('inputModelId', model_id(input_model_name))        
        cloze_model_id = mt.get('clozeModelId', model_id(cloze_model_name))
        basic_model_id = mt.get('basicModelId', model_id(basic_model_name))
        template = mt.get('template', 'specialstyle')


        fmtClozeQ = fmtClozeA = None
        fmtInputQ = fmtInputA = None
        fmtQ = fmtA = None

        if template == 'specialstyle':
            CSS += _read_template(template_dir, "custom.css", "", "")
        elif template == 'nostyle':
            CSS = ""
        elif template == 'abhiyan':
            CSS = _read_template(template_dir, 'abhiyan.css', "", "")
            CLOZE_STYLE = _read_template(template_dir, "abhiyan_cloze_style.css", "", "")

            fmtClozeQ = _read_template(template_dir, "abhiyan_cloze_front.html", "", "")
            fmtClozeA = _read_template(template_dir, "abhiyan_cloze_back.html", "", "")
            fmtQ = _read_template(template_dir, "abhiyan_basic_front.html", "", "")
            fmtA = _read_template(template_dir, "abhiyan_basic_back.html", "", "")
            fmtInputQ = _read_template(template_dir, "abhiyan_input_front.html", "", "")
            fmtInputA =_read_template(template_dir, "abhiyan_basic_back.html", "", "") # Note: reusing the basic back, essentially the same.
        # else notionstyle

        for deck in data:
            cards = deck.get("cards", [])
            notes = []
            for card in cards:
                fields = [card["name"], card["back"], ",".join(card["media"])]
                model = basic_model(basic_model_id, basic_model_name, CSS, fmtQ, fmtA) 
                if card.get('cloze', False) and "{{c" in card["name"] :
                    model = cloze_model(cloze_model_id, cloze_model_name, CLOZE_STYLE + "\n" + CSS, fmtClozeQ, fmtClozeA)
                elif card.get('enableInput', False) and card.get('answer', False):
                    model = input_model(input_model_id, input_model_name, CSS, fmtInputQ, fmtInputA)
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
            if deck.get('emptyDescription', False):
                deck_desc = ''
            else:
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
