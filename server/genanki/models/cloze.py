
from genanki import Model

def cloze_model(id, name, css):
    return Model(
        id, name,
        fields=[
            {"name": "Text"},
            {"name": "Extra"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "notion2Anki Cloze Card",
                "qfmt": '<span class="front-text-pre">{{cloze:Text}}</span>',
                "afmt": '<span class="front-text-pre">{{cloze:Text}}</span><br><span class="extra">{{Extra}}</span>',
            },
        ],
        css=css,
        model_type=Model.CLOZE,
    )