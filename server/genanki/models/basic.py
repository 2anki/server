from genanki import Model

def basic_model(id, name, css):
    return Model(id, name,
       fields=[
            {"name": "Front"},
            {"name": "Back"},
            {"name": "MyMedia"},
        ],
        templates=[
            {
                "name": "card1",
                "qfmt": '<span class="front-text-pre">{{Front}}</span>',
                "afmt": '<span class="front-text-post">{{Front}}</span>'
                '<hr id="answer">'
                '<span class="back-text">{{Back}}</span>',
            }
        ],
        css=css,
    )