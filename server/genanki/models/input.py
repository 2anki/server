from genanki import Model

DEFAULT_INPUT_FRONT = "{{Front}}" "<br>" "{{type:Input}}"
DEFAULT_INPUT_BACK = "{{FrontSide}}" '<hr id="answer">' "{{Back}}"

def input_model(id, name, css, qfmt, afmt):
        if qfmt is None:
                qfmt = DEFAULT_INPUT_FRONT
        if afmt is None:
                afmt = DEFAULT_INPUT_BACK
        return Model(id, name,
                fields=[
                {"name": "Front"},
                {"name": "Back"},
                {"name": "Input"},
                {"name": "MyMedia"},
                ],
                templates=[
                {
                        "name": name,
                        "qfmt": qfmt,
                        "afmt": afmt,
                }
                ],
                css=css,
        )
