"""
Test tags
"""
from . import sanitize_tags


def test_sanitize_tags():
    """
    Test that we handle empty space in the tag
    :return:
    """
    assert sanitize_tags.sanitize_tags({'a  a'}) == ['a--a']
