import os
import json
from genanki import Model
from fs_util import _read_template

DEFAULT_INPUT = json.loads(
        _read_template(os.path.dirname(__file__)+"/../../templates/", "n2a-input.json", "", "")
        )

def input_model(id, name, css, qfmt, afmt):
        if qfmt is None:
                qfmt = DEFAULT_INPUT.get("front")
        if afmt is None:
                afmt = DEFAULT_INPUT.get("back")
        return Model(id, name,
                fields = DEFAULT_INPUT.get("fields"),
                templates=[
                {
                        "name": name,
                        "qfmt": qfmt,
                        "afmt": afmt,
                }
                ],
                css=css,
        )
