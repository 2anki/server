"""
Write APKG file to disk
"""

import os
import sys

from genanki import Deck, Package


def _write_new_apkg(payload, media_files):
    first_id = ""
    decks = []

    for deck_payload in payload:
        deck = Deck(deck_id=deck_payload["id"], name=deck_payload["name"],
                    description=deck_payload["desc"])
        if not first_id:
            first_id = deck_payload["id"]
        for note in deck_payload["notes"]:
            deck.add_note(note)
        decks.append(deck)

    pkg = Package(decks)
    pkg.media_files = media_files
    fout_anki = f'{first_id}.apkg'

    pkg.write_to_file(fout_anki)
    sys.stdout.write(os.getcwd() + "/" + fout_anki)
