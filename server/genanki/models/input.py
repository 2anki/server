from genanki import Model

DEFAULT_INPUT_FRONT = "{{Front}}" "<br>" "{{type:Input}}"
DEFAULT_INPUT_BACK = "{{FrontSide}}" '<hr id="answer">' "{{Back}}"

def input_model(id, name, css, qfmt, afmt):
        if qfmt is None:
                DEFAULT_INPUT_FRONT = qfmt
        if afmt is None:
                DEFAULT_INPUT_BACK = afmt                
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
