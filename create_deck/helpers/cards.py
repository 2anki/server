"""
Helper functions for working with the flashcards
"""
import sys
import ftfy


def get_safe_value(value):
    """
    Remove any surrogates in the value.  Handles non-string inputs gracefully.
    :param value: The value to process.
    :return: The processed value, or None if the input is invalid.
    """
    if isinstance(value, bytes):
        try:
            value = value.decode('utf-8') # Decode bytes to string, handling potential errors
        except UnicodeDecodeError:
            print("Warning: Could not decode bytes using utf-8. Returning empty string.", file=sys.stderr)
            return ""
    elif value is None:
        return ""
    elif not isinstance(value, str):
        print(f"Warning: get_safe_value received unexpected input type: {type(value)}. Returning empty string.", file=sys.stderr)
        return ""

    return ftfy.fixes.fix_surrogates(value)
