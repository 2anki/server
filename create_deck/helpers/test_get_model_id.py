"""
Test for get_model_id
"""

from . import get_model_id


def test_get_model_id():
    """
    :return: nothing
    """
    assert get_model_id.get_model_id("n2a-input") == 6394002335189144856
    assert get_model_id.get_model_id("n2a-cloze") == 998877661
    assert get_model_id.get_model_id("n2a-basic") == 2020
