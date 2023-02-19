from . import sanitize_tags


def test_sanitize_tags():
    assert (sanitize_tags.sanitize_tags({'a  a'}) == ['a--a'])
