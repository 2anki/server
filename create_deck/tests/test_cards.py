import unittest
from helpers.cards import get_safe_value

class TestCards(unittest.TestCase):
    def test_get_safe_value_string(self):
        self.assertEqual(get_safe_value("This is a test string."), "This is a test string.")

    def test_get_safe_value_bytes(self):
        self.assertEqual(get_safe_value(b"This is a test string."), "This is a test string.")

    def test_get_safe_value_none(self):
        self.assertEqual(get_safe_value(None), "")

    def test_get_safe_value_invalid_type(self):
        self.assertEqual(get_safe_value(123), "")
        self.assertEqual(get_safe_value([1,2,3]), "")
        self.assertEqual(get_safe_value({'a':1}), "")

if __name__ == '__main__':
    unittest.main() 