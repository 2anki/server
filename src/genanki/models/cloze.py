import os
import json
from genanki import Model
from fs_util import _read_template

DEFAULT_CLOZE = json.loads(_read_template(os.path.dirname(__file__)+"/../../templates/", "n2a-cloze.json", "", ""))

def cloze_model(id, name, css, qfmt, afmt):
    if qfmt is None:
        qfmt = DEFAULT_CLOZE.get('front')
    if afmt is None:
        afmt  = DEFAULT_CLOZE.get('back')
        
    return Model(
        id, name,
        fields = DEFAULT_CLOZE.get("fields"),
        templates=[
            {
                "name": name,
                "qfmt": qfmt,
                "afmt": afmt,
            },
        ],
        css=css,
        model_type=Model.CLOZE,
    )