"""
This file is a modifcation on one of the test files of genanki[0].
It's used to create the APKG file from the JSON structure produced
by the Notion to Anki parser.

[0]: https://github.com/kerrickstaley/genanki
"""

import hashlib
import json
import sys

import sentry_sdk
from genanki.util import guid_for
from genanki import Note

from fs_util import _read_template, _wr_apkg
from models.input import input_model
from models.cloze import cloze_model
from models.basic import basic_model

sentry_sdk.init(
    "https://a836d36ba5174e72b7d90ebb6da0c1ef@o404766.ingest.sentry.io/6340010",
    traces_sample_rate=1.0
)

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
    if len(sys.argv) < 2:
        raise IOError('missing payload arguments(data file, deck style, template dir)')
    data_file = sys.argv[1]
    template_dir = sys.argv[2]

    CLOZE_STYLE = _read_template(template_dir, "cloze_style.css", "", "")

    with open(data_file, "r", encoding="utf-8") as json_file:
        data = json.load(json_file)
        media_files = []
        decks = []

        # Model / Template stuff
        mt = data[0]["settings"]
        styling = data[0].get('style', "") or ""

        # Retreive template names for user or get the default ones
        cloze_model_name = mt.get('clozeModelName', "n2a-cloze") or  "n2a-cloze"
        basic_model_name = mt.get('basicModelName', "n2a-basic") or "n2a-basic"
        input_model_name = mt.get('inputModelName', "n2a-input") or "n2a-input"

        # Set the model ids based on the template name
        input_model_id = mt.get('inputModelId', model_id(input_model_name))        
        cloze_model_id = mt.get('clozeModelId', model_id(cloze_model_name))
        basic_model_id = mt.get('basicModelId', model_id(basic_model_name))
        template = mt.get('template', 'specialstyle')

        fmtClozeQ = fmtClozeA = None
        fmtInputQ = fmtInputA = None
        fmtQ = fmtA = None

        # Respect user's choice of template
        if template == 'specialstyle':
            styling += _read_template(template_dir, "custom.css", "", "")
        elif template == 'nostyle':
            styling = ""
        elif template == 'abhiyan':
            styling = _read_template(template_dir, 'abhiyan.css', "", "")
            CLOZE_STYLE = _read_template(template_dir, "abhiyan_cloze_style.css", "", "")
            fmtClozeQ = _read_template(template_dir, "abhiyan_cloze_front.html", "", "")
            fmtClozeA = _read_template(template_dir, "abhiyan_cloze_back.html", "", "")
            fmtQ = _read_template(template_dir, "abhiyan_basic_front.html", "", "")
            fmtA = _read_template(template_dir, "abhiyan_basic_back.html", "", "")
            fmtInputQ = _read_template(template_dir, "abhiyan_input_front.html", "", "")
            fmtInputA =_read_template(template_dir, "abhiyan_basic_back.html", "", "") # Note: reusing the basic back, essentially the same.
        elif template == 'alex_deluxe':
            styling = _read_template(template_dir, 'alex_deluxe.css', "", "")
            CLOZE_STYLE = _read_template(template_dir, "alex_deluxe_cloze_style.css", "", "")
            fmtClozeQ = _read_template(template_dir, "alex_deluxe_cloze_front.html", "", "")
            fmtClozeA = _read_template(template_dir, "alex_deluxe_cloze_back.html", "", "")
            fmtQ = _read_template(template_dir, "alex_deluxe_basic_front.html", "", "")
            fmtA = _read_template(template_dir, "alex_deluxe_basic_back.html", "", "")
            fmtInputQ = _read_template(template_dir, "alex_deluxe_input_front.html", "", "")
            fmtInputA =_read_template(template_dir, "alex_deluxe_input_back.html", "", "")
        # else notionstyle
        CLOZE_STYLE = CLOZE_STYLE + "\n" + styling

        BASIC_STYLE = styling
        BASIC_FRONT = fmtQ
        BASIC_BACK = fmtA
        n2aBasic = mt.get("n2aBasic")
        if n2aBasic:
            BASIC_STYLE = n2aBasic["styling"]
            BASIC_FRONT = n2aBasic["front"]
            BASIC_BACK = n2aBasic["back"]

        CLOZE_FRONT = fmtClozeQ
        CLOZE_BACK = fmtClozeA
        n2aCloze = mt.get("n2aCloze")
        if n2aCloze:
            CLOZE_STYLE = n2aCloze["styling"]
            CLOZE_FRONT = n2aCloze["front"]
            CLOZE_BACK = n2aCloze["back"]
        
        n2aInput = mt.get("n2aInput")
        INPUT_FRONT = fmtInputQ
        INPUT_BACK = fmtInputA
        INPUT_STYLE = styling
        if n2aInput:
            INPUT_STYLE = n2aInput["styling"]
            INPUT_FRONT = n2aInput["front"]
            INPUT_BACK = n2aInput["back"]

        for deck in data:
            cards = deck.get("cards", [])
            notes = []
            for card in cards:
                fields = [card["name"], card["back"], ",".join(card["media"])]
                model = basic_model(basic_model_id, basic_model_name, BASIC_STYLE, BASIC_FRONT, BASIC_BACK) 
                if card.get('cloze', False) and "{{c" in card["name"] :
                    model = cloze_model(cloze_model_id, cloze_model_name, CLOZE_STYLE , CLOZE_FRONT, CLOZE_BACK)
                elif card.get('enableInput', False) and card.get('answer', False):
                    model = input_model(input_model_id, input_model_name, INPUT_STYLE, INPUT_FRONT, INPUT_BACK)
                    fields = [
                        card["name"].replace("{{type:Input}}", ""),
                        card["back"],
                        card["answer"],
                        ",".join(card["media"]),
                    ]
                # Cards marked with -1 number means they are breaking compatability, treat them differently by using their respective Notion Id
                if card["number"] == -1 and "notionId" in card:
                    card["number"] = card["notionId"]

                if mt.get("useNotionId") and "notionId" in card:
                    g = guid_for(card["notionId"])
                    my_note = Note(model, fields=fields, sort_field=card["number"], tags=card['tags'], guid=g)
                    notes.append(my_note)
                else:
                    my_note = Note(model, fields=fields, sort_field=card["number"], tags=card['tags'])
                    notes.append(my_note)
                media_files = media_files + card["media"]            
            decks.append(
                {
                    "notes": notes,
                    "id": deck["id"],
                    "desc": "",
                    "name": deck["name"],
                }
            )

    _wr_apkg(decks, media_files)
