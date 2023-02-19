def sanitize_tags(tags):
    if len(tags) == 0:
        return tags
    return [tag.replace(' ', '-') for tag in tags]
