from genanki import Model

DEFAULT_CLOZE_FRONT = '<span class="front-text-pre">{{cloze:Text}}</span>'
DEFAULT_CLOZE_BACK = '<span class="front-text-pre">{{cloze:Text}}</span><br><span class="extra">{{Extra}}</span>'

def cloze_model(id, name, css, qfmt, afmt):
    if qfmt is None:
        qfmt = DEFAULT_CLOZE_FRONT             
    if afmt is None:
        afmt  = DEFAULT_CLOZE_BACK
        
    return Model(
        id, name,
        fields=[
            {"name": "Text"},
            {"name": "Extra"},
            {"name": "MyMedia"},
        ],
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