from genanki import Model

def basic_model(id, name, css):
    return Model(id, name,
        fields=[
            {"name": "AField"},
            {"name": "BField"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "card1",
                "qfmt": '<span class="front-text-pre">{{AField}}</span>',
                "afmt": '<span class="front-text-post">{{AField}}</span>'
                '<hr id="answer">'
                '<span class="back-text">{{BField}}</span>',
            }
        ],
        css=css,
    )