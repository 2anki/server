
from genanki import Model

def input_model(id, name, css):
        return Model(id, name,
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
                css=css,
        )
