"""
add root suffix
"""
import sys


def _path_start():
    if sys.platform == "win32":
        return "C:"
    return "/"
