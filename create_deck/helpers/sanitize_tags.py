"""
Todo move this into a Tag class
"""


def sanitize_tags(tags):
    """
    Remove invalid characters from the tag.
    :param tags:
    :return:
    """
    if len(tags) == 0:
        return tags
    return [tag.replace(' ', '-') for tag in tags]
