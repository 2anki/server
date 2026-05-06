"""
Helper function to add image to the deck description.
"""
from .read_template import read_template


def _build_deck_description(template_dir, image):
    return read_template(template_dir, "deck_description.html", "%s", image)
