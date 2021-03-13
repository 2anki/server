from genanki import Model

DEFAULT_BASIC_FRONT = '<span class="front-text-pre">{{Front}}</span>'
DEFAULT_BASIC_BACK = '<span class="front-text-post">{{Front}}</span>' '<hr id="answer">' '<span class="back-text">{{Back}}</span>'

def basic_model(id, name, css, qfmt, afmt):
    if qfmt is None:
        qmft = DEFAULT_BASIC_FRONT
    if afmt is None:
        afmt = DEFAULT_BASIC_BACK
        
    return Model(id, name,
       fields=[
            {"name": "Front"},
            {"name": "Back"},
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