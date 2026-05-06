"""
Template files
"""
import json
import os


def get_template_path():
    """
    helper to find path to the server's template directory
    :return:
    """
    return os.path.dirname(__file__) + "/../../server/src/templates/"


def get_template(path):
    """
    read the template
    :param path:
    :return:
    """
    file_path = get_template_path() + path
    with open(file_path, "r", encoding="utf-8") as file:
        return json.loads(file.read())
