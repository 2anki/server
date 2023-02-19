"""
Retrieve the correct genanki model
"""
from genanki import Model

from .get_template import get_template

MODEL_INFO = {
    "cloze": {
        "file_name": "n2a-cloze.json",
        "model_type": Model.CLOZE
    },
    "basic": {
        "file_name": "n2a-basic.json",
        "model_type": Model.FRONT_BACK
    },
    "input": {
        "file_name": "n2a-input.json",
        "model_type": Model.FRONT_BACK
    }
}


def get_model(descriptor):
    """
    load the correct model based on type
    :param descriptor:
    :return:
    """
    model_type, model_id, name, css, qfmt, afmt = descriptor
    model_info = MODEL_INFO[model_type]
    template_file = get_template(model_info.get("file_name"))

    if qfmt is None:
        qfmt = template_file.get('front')
    if afmt is None:
        afmt = template_file.get('back')

    return Model(
        model_id, name,
        fields=template_file.get("fields"),
        templates=[
            {
                "name": name,
                "qfmt": qfmt,
                "afmt": afmt,
            },
        ],
        css=css,
        model_type=model_info.get("model_type"),
    )
